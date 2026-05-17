import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SEED_PROS } from "@/lib/seed-pros";
import { toast } from "sonner";
import { Sparkles, BadgeCheck, MessageSquare, Briefcase, Loader2, Github, Instagram, Youtube, Globe } from "lucide-react";

export const Route = createFileRoute("/p/$username")({
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username} — Professionals` },
      { name: "description", content: `${params.username}'s portfolio on Professionals.` },
    ],
  }),
  component: ProfilePage,
});

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  profession: string | null;
  skills: string[] | null;
  avatar_url: string | null;
  banner_url: string | null;
  accent_color: string | null;
  is_premium: boolean;
  is_verified: boolean;
  is_available_for_hire: boolean;
  follower_count: number;
  github_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  website_url: string | null;
};

type PortfolioItem = {
  id: string;
  title: string;
  description: string | null;
  media_url: string | null;
  category: string;
};

function ProfilePage() {
  const { username } = Route.useParams();
  const { user, profile: me } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const seed = SEED_PROS.find((p) => p.username === username);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data as Profile | null);
        setLoading(false);
        if (data) {
          supabase
            .from("portfolio_items")
            .select("id, title, description, media_url, category")
            .eq("user_id", (data as Profile).id)
            .order("created_at", { ascending: false })
            .then(({ data: pi }) => setItems((pi ?? []) as PortfolioItem[]));
        }
      });
  }, [username]);

  if (loading) return <div className="py-20 text-center text-muted-foreground"><Loader2 className="w-5 h-5 mx-auto animate-spin" /></div>;

  // Use seed data as fallback if no real profile yet
  const view = profile ?? (seed && {
    id: seed.username,
    username: seed.username,
    display_name: seed.display_name,
    bio: seed.bio,
    profession: seed.profession,
    skills: seed.skills,
    avatar_url: null,
    banner_url: null,
    accent_color: null,
    is_premium: seed.is_premium ?? false,
    is_verified: seed.is_verified ?? false,
    is_available_for_hire: true,
    follower_count: 0,
    github_url: null, instagram_url: null, youtube_url: null, website_url: null,
  } as Profile);

  if (!view) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">@{username} hasn't joined yet.</p>
        <Link to="/discover" className="text-sm underline mt-2 inline-block">Back to discover</Link>
      </div>
    );
  }

  const isOwn = me?.username === view.username;

  const message = async () => {
    if (!user || !me) return navigate({ to: "/login" });
    if (!profile) return toast.error("This professional hasn't joined yet.");
    if (profile.id === me.id) return;
    const [a, b] = [me.id, profile.id].sort();
    const { data: existing } = await supabase.from("conversations").select("id").eq("user_a", a).eq("user_b", b).maybeSingle();
    let cid = existing?.id;
    if (!cid) {
      const { data: created, error } = await supabase.from("conversations").insert({ user_a: a, user_b: b }).select("id").single();
      if (error) return toast.error(error.message);
      cid = created.id;
    }
    navigate({ to: "/messages/$id", params: { id: cid! } });
  };

  const works = seed?.works ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Banner */}
      <div
        className="h-40 md:h-56 rounded-3xl border border-white/10 mb-4"
        style={{
          background: view.banner_url
            ? `url(${view.banner_url}) center/cover`
            : `linear-gradient(135deg, ${view.accent_color ?? "#222"}, #0a0a0a)`,
        }}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 px-4 md:px-8 mb-6">
        <div
          className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-background shrink-0"
          style={{ background: seed?.avatar_gradient ?? `linear-gradient(135deg, ${view.accent_color ?? "#444"}, #0a0a0a)` }}
        >
          {view.avatar_url && <img src={view.avatar_url} className="w-full h-full rounded-2xl object-cover" alt="" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{view.display_name ?? view.username}</h1>
            {view.is_verified && <BadgeCheck className="w-5 h-5" />}
            {view.is_premium && <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary text-primary-foreground flex items-center gap-1"><Sparkles className="w-3 h-3" /> Pro</span>}
          </div>
          <p className="text-sm text-muted-foreground">@{view.username} · {view.profession ?? "Professional"}</p>
        </div>

        <div className="flex gap-2">
          {!isOwn && (
            <>
              <button onClick={message} className="px-4 py-2 glass rounded-xl text-sm font-medium flex items-center gap-1.5 hover:bg-white/8">
                <MessageSquare className="w-3.5 h-3.5" /> Message
              </button>
              <Link to="/hire/$username" params={{ username: view.username }} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Hire
              </Link>
            </>
          )}
          {isOwn && (
            <Link to="/settings" className="px-4 py-2 glass rounded-xl text-sm font-medium">Edit profile</Link>
          )}
        </div>
      </div>

      {/* Bio + socials */}
      <div className="px-4 md:px-8 mb-8">
        <p className="text-sm leading-relaxed max-w-2xl">{view.bio ?? "No bio yet."}</p>
        <div className="flex gap-2 flex-wrap mt-3">
          {view.skills?.map((s) => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded glass uppercase tracking-wider">{s}</span>
          ))}
        </div>
        <div className="flex gap-3 mt-4 text-muted-foreground">
          {view.github_url && <a href={view.github_url} target="_blank" rel="noopener"><Github className="w-4 h-4 hover:text-foreground" /></a>}
          {view.instagram_url && <a href={view.instagram_url} target="_blank" rel="noopener"><Instagram className="w-4 h-4 hover:text-foreground" /></a>}
          {view.youtube_url && <a href={view.youtube_url} target="_blank" rel="noopener"><Youtube className="w-4 h-4 hover:text-foreground" /></a>}
          {view.website_url && <a href={view.website_url} target="_blank" rel="noopener"><Globe className="w-4 h-4 hover:text-foreground" /></a>}
        </div>
      </div>

      {/* Portfolio grid */}
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 px-4 md:px-8">Work</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-8">
        {items.map((it) => (
          <div key={it.id} className="glass-card rounded-2xl overflow-hidden hover-lift">
            <div className="aspect-video bg-white/5">
              {it.media_url && <img src={it.media_url} className="w-full h-full object-cover" alt={it.title} />}
            </div>
            <div className="p-4">
              <p className="font-medium text-sm">{it.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{it.category}</p>
            </div>
          </div>
        ))}
        {works.map((w, i) => (
          <div key={`seed-${i}`} className="glass-card rounded-2xl overflow-hidden hover-lift">
            <div className="aspect-video" style={{ background: w.gradient }} />
            <div className="p-4">
              <p className="font-medium text-sm">{w.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{w.category}</p>
            </div>
          </div>
        ))}
        {items.length === 0 && works.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-12 glass-card rounded-2xl">
            No work uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
}
