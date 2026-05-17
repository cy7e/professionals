import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/messages/$id")({
  head: () => ({ meta: [{ title: "Chat — Professionals" }] }),
  component: Chat,
});

type Msg = { id: string; content: string; sender_id: string; created_at: string };

function Chat() {
  const { id } = Route.useParams();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [other, setOther] = useState<{ username: string; display_name: string | null; avatar_url: string | null } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!profile) return;

    supabase
      .from("conversations")
      .select("user_a, user_b")
      .eq("id", id)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!data) return;
        const otherId = data.user_a === profile.id ? data.user_b : data.user_a;
        const { data: p } = await supabase.from("profiles").select("username, display_name, avatar_url").eq("id", otherId).maybeSingle();
        setOther(p as any);
      });

    supabase
      .from("messages")
      .select("id, content, sender_id, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMsgs((data ?? []) as Msg[]));

    const ch = supabase
      .channel(`msg:${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        (payload) => setMsgs((m) => [...m, payload.new as Msg]))
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [id, profile]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    if (!profile || !text.trim()) return;
    const content = text.trim();
    setText("");
    const { error } = await supabase.from("messages").insert({
      conversation_id: id, sender_id: profile.id, content,
    });
    if (error) {
      toast.error(error.message);
      setText(content);
      return;
    }
    await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", id);
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground"><Loader2 className="w-5 h-5 mx-auto animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col h-[calc(100vh-9rem)]">
      <div className="flex items-center gap-3 mb-3">
        <Link to="/messages" className="p-2 rounded-full hover:bg-white/5"><ChevronLeft className="w-4 h-4" /></Link>
        <div className="w-9 h-9 rounded-full bg-white/10 overflow-hidden">
          {other?.avatar_url && <img src={other.avatar_url} className="w-full h-full object-cover" alt="" />}
        </div>
        <div>
          <p className="font-medium text-sm">{other?.display_name ?? other?.username ?? "—"}</p>
          <p className="text-xs text-muted-foreground">@{other?.username}</p>
        </div>
      </div>

      <div className="flex-1 glass-card rounded-2xl p-4 overflow-y-auto space-y-2">
        {msgs.length === 0 && <div className="text-center text-sm text-muted-foreground py-12">Say hi.</div>}
        {msgs.map((m) => {
          const mine = m.sender_id === profile?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "glass"}`}>
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Message…"
          className="flex-1 glass rounded-full px-4 py-2.5 text-sm outline-none focus:border-white/30" />
        <button onClick={send} disabled={!text.trim()} className="px-4 bg-primary text-primary-foreground rounded-full disabled:opacity-40">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
