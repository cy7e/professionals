import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/messages/")({
  head: () => ({ meta: [{ title: "Messages — Professionals" }] }),
  component: Messages,
});

type Conv = {
  id: string;
  user_a: string;
  user_b: string;
  last_message_at: string;
  other?: { username: string; display_name: string | null; avatar_url: string | null };
};

function Messages() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [convs, setConvs] = useState<Conv[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("conversations")
      .select("id, user_a, user_b, last_message_at")
      .or(`user_a.eq.${profile.id},user_b.eq.${profile.id}`)
      .order("last_message_at", { ascending: false })
      .then(async ({ data }) => {
        const list = (data ?? []) as Conv[];
        const ids = list.map((c) => (c.user_a === profile.id ? c.user_b : c.user_a));
        if (ids.length === 0) return setConvs([]);
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .in("id", ids);
        const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
        setConvs(list.map((c) => ({ ...c, other: map.get(c.user_a === profile.id ? c.user_b : c.user_a) })));
      });
  }, [profile]);

  if (loading) return <div className="py-20 text-center text-muted-foreground"><Loader2 className="w-5 h-5 mx-auto animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Messages</h1>
      <div className="glass-card rounded-2xl overflow-hidden">
        {convs.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No conversations yet. Visit a profile and tap Message.
          </div>
        )}
        {convs.map((c) => (
          <Link
            key={c.id}
            to="/messages/$id"
            params={{ id: c.id }}
            className="flex items-center gap-3 p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-white/10 shrink-0 overflow-hidden">
              {c.other?.avatar_url && <img src={c.other.avatar_url} className="w-full h-full object-cover" alt="" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{c.other?.display_name ?? c.other?.username ?? "—"}</p>
              <p className="text-xs text-muted-foreground">@{c.other?.username}</p>
            </div>
            <span className="text-[11px] text-muted-foreground">{new Date(c.last_message_at).toLocaleDateString()}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
