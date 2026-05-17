import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Heart, MessageCircle, Send, Sparkles } from "lucide-react";

export const Route = createFileRoute("/feed")({
  head: () => ({ meta: [{ title: "Feed — Professionals" }] }),
  component: Feed,
});

type Post = {
  id: string;
  content: string;
  media_url: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
  user_id: string;
  profile?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    is_premium: boolean;
    is_verified: boolean;
  } | null;
};

function Feed() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  const load = async () => {
    const { data } = await supabase
      .from("posts")
      .select("id, content, media_url, like_count, comment_count, created_at, user_id, profile:profiles!posts_user_id_fkey(username, display_name, avatar_url, is_premium, is_verified)")
      .order("created_at", { ascending: false })
      .limit(30);
    setPosts((data ?? []) as unknown as Post[]);
  };

  useEffect(() => {
    load();
  }, []);

  const post = async () => {
    if (!profile || !content.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("posts").insert({ user_id: profile.id, content: content.trim() });
    setPosting(false);
    if (error) return toast.error(error.message);
    setContent("");
    load();
  };

  const like = async (postId: string) => {
    if (!profile) return;
    await supabase.from("post_likes").upsert({ post_id: postId, user_id: profile.id });
    // optimistic
    setPosts((p) => p.map((x) => (x.id === postId ? { ...x, like_count: x.like_count + 1 } : x)));
  };

  if (loading) return <div className="text-center py-20 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>;

  return (
    <div className="px-4 max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Feed</h1>

      {/* Composer */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 shrink-0 grid place-items-center text-sm font-medium">
            {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" alt="" /> : profile?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Share your latest work or thought…"
              className="w-full bg-transparent outline-none resize-none placeholder:text-muted-foreground"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-muted-foreground">{content.length}/500</span>
              <button onClick={post} disabled={!content.trim() || posting}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full disabled:opacity-40">
                {posting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {posts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm glass-card rounded-2xl">
            No posts yet. Be the first.
          </div>
        )}
        {posts.map((p) => (
          <article key={p.id} className="glass-card rounded-2xl p-4 animate-fade-up">
            <div className="flex items-center gap-3 mb-3">
              <Link to="/p/$username" params={{ username: p.profile?.username ?? "" }}
                className="w-10 h-10 rounded-full bg-white/10 shrink-0 overflow-hidden grid place-items-center text-sm">
                {p.profile?.avatar_url ? <img src={p.profile.avatar_url} alt="" className="w-full h-full object-cover" /> : p.profile?.username?.[0]?.toUpperCase()}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <Link to="/p/$username" params={{ username: p.profile?.username ?? "" }} className="font-semibold text-sm truncate hover:underline">
                    {p.profile?.display_name ?? p.profile?.username}
                  </Link>
                  {p.profile?.is_premium && <Sparkles className="w-3 h-3 shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground">@{p.profile?.username} · {new Date(p.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{p.content}</p>
            <div className="flex items-center gap-5 mt-4 text-xs text-muted-foreground">
              <button onClick={() => like(p.id)} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <Heart className="w-3.5 h-3.5" /> {p.like_count}
              </button>
              <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> {p.comment_count}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
