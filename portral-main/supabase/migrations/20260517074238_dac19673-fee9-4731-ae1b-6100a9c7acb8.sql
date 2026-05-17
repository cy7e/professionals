
-- Roles
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Roles are viewable by everyone" on public.user_roles for select using (true);

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text,
  profession text,
  skills text[] default '{}',
  avatar_url text,
  banner_url text,
  accent_color text default '#ffffff',
  discord_url text,
  instagram_url text,
  youtube_url text,
  twitter_url text,
  github_url text,
  website_url text,
  is_verified boolean not null default false,
  is_featured boolean not null default false,
  is_premium boolean not null default false,
  is_available_for_hire boolean not null default true,
  follower_count integer not null default 0,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles are public" on public.profiles for select using (true);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1),
    'user' || substr(new.id::text, 1, 8)
  );
  base_username := lower(regexp_replace(base_username, '[^a-z0-9_]', '', 'gi'));
  if length(base_username) < 3 then base_username := 'user' || substr(new.id::text, 1, 6); end if;

  final_username := base_username;
  while exists(select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', final_username),
    new.raw_user_meta_data->>'avatar_url'
  );

  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Update timestamp helper
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

-- Portfolio items
create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  media_url text,
  media_type text default 'image',
  category text default 'professional',
  external_url text,
  view_count integer not null default 0,
  like_count integer not null default 0,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.portfolio_items enable row level security;
create policy "Portfolio public" on public.portfolio_items for select using (true);
create policy "Owner insert portfolio" on public.portfolio_items for insert with check (auth.uid() = user_id);
create policy "Owner update portfolio" on public.portfolio_items for update using (auth.uid() = user_id);
create policy "Owner delete portfolio" on public.portfolio_items for delete using (auth.uid() = user_id);

-- Posts (social feed)
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  media_url text,
  like_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.posts enable row level security;
create policy "Posts public" on public.posts for select using (true);
create policy "Owner create post" on public.posts for insert with check (auth.uid() = user_id);
create policy "Owner update post" on public.posts for update using (auth.uid() = user_id);
create policy "Owner delete post" on public.posts for delete using (auth.uid() = user_id);

create table public.post_likes (
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table public.post_likes enable row level security;
create policy "Likes public" on public.post_likes for select using (true);
create policy "Auth users like" on public.post_likes for insert with check (auth.uid() = user_id);
create policy "Auth users unlike" on public.post_likes for delete using (auth.uid() = user_id);

-- Follows
create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
alter table public.follows enable row level security;
create policy "Follows public" on public.follows for select using (true);
create policy "Auth users follow" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Auth users unfollow" on public.follows for delete using (auth.uid() = follower_id);

-- Conversations / messages
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid references public.profiles(id) on delete cascade not null,
  user_b uuid references public.profiles(id) on delete cascade not null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_a, user_b),
  check (user_a < user_b)
);
alter table public.conversations enable row level security;
create policy "Participants view conversation" on public.conversations for select
  using (auth.uid() = user_a or auth.uid() = user_b);
create policy "Auth users create conversation" on public.conversations for insert
  with check (auth.uid() = user_a or auth.uid() = user_b);
create policy "Participants update conversation" on public.conversations for update
  using (auth.uid() = user_a or auth.uid() = user_b);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
create policy "Participants view messages" on public.messages for select
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id and (auth.uid() = c.user_a or auth.uid() = c.user_b)
  ));
create policy "Participants send messages" on public.messages for insert
  with check (
    auth.uid() = sender_id and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (auth.uid() = c.user_a or auth.uid() = c.user_b)
    )
  );

alter publication supabase_realtime add table public.messages;

-- Commissions
create type public.commission_status as enum ('pending', 'approved', 'rejected', 'paid', 'completed', 'cancelled');

create table public.commissions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete cascade not null,
  professional_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  brief text not null,
  budget_cents integer not null,
  deadline date,
  reference_url text,
  status commission_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.commissions enable row level security;
create policy "Parties view commission" on public.commissions for select
  using (auth.uid() = client_id or auth.uid() = professional_id);
create policy "Client create commission" on public.commissions for insert
  with check (auth.uid() = client_id);
create policy "Parties update commission" on public.commissions for update
  using (auth.uid() = client_id or auth.uid() = professional_id);

create trigger commissions_touch before update on public.commissions for each row execute function public.touch_updated_at();

-- Subscriptions (premium)
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  status text not null default 'inactive',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
create policy "Users view own subscription" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Users insert own subscription" on public.subscriptions for insert with check (auth.uid() = user_id);
create policy "Users update own subscription" on public.subscriptions for update using (auth.uid() = user_id);

create trigger subscriptions_touch before update on public.subscriptions for each row execute function public.touch_updated_at();

-- Indexes
create index on public.posts (created_at desc);
create index on public.portfolio_items (user_id, created_at desc);
create index on public.messages (conversation_id, created_at desc);
create index on public.follows (following_id);
create index on public.profiles (is_featured) where is_featured = true;
