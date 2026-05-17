import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Briefcase, Loader2 } from "lucide-react";

export const Route = createFileRoute("/hire/$username")({
  head: ({ params }) => ({ meta: [{ title: `Hire @${params.username} — Professionals` }] }),
  component: Hire,
});

function Hire() {
  const { username } = Route.useParams();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [pro, setPro] = useState<{ id: string; display_name: string | null; username: string } | null>(null);
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [ref, setRef] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    supabase.from("profiles").select("id, username, display_name").eq("username", username).maybeSingle()
      .then(({ data }) => setPro(data as any));
  }, [username]);

  const submit = async () => {
    if (!profile || !pro) return;
    const cents = Math.round(parseFloat(budget) * 100);
    if (!title || !brief || !cents) return toast.error("Fill out title, brief, and budget.");
    setSubmitting(true);
    const { error } = await supabase.from("commissions").insert({
      client_id: profile.id,
      professional_id: pro.id,
      title,
      brief,
      budget_cents: cents,
      deadline: deadline || null,
      reference_url: ref || null,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Request sent. The professional will be notified.");
    navigate({ to: "/p/$username", params: { username } });
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground"><Loader2 className="w-5 h-5 mx-auto animate-spin" /></div>;
  if (!pro) return (
    <div className="max-w-md mx-auto py-20 text-center">
      <p className="text-muted-foreground">@{username} hasn't joined yet.</p>
      <Link to="/discover" className="text-sm underline mt-2 inline-block">Back</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="glass-card rounded-3xl p-6 md:p-8 animate-fade-up">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="w-4 h-4" />
          <h1 className="text-xl font-bold">Hire @{pro.username}</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Send a commission request. Payment is held until approval.</p>

        <label className="text-xs uppercase tracking-widest text-muted-foreground">Project title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120}
          placeholder="e.g. 60s vertical edit for product launch"
          className="w-full glass rounded-xl px-4 py-3 mt-1 mb-4 outline-none focus:border-white/30" />

        <label className="text-xs uppercase tracking-widest text-muted-foreground">Brief</label>
        <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={5} maxLength={1500}
          placeholder="Describe the work, deliverables, tone…"
          className="w-full glass rounded-xl px-4 py-3 mt-1 mb-4 outline-none resize-none focus:border-white/30" />

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Budget (USD)</label>
            <input type="number" min="1" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="500"
              className="w-full glass rounded-xl px-4 py-3 mt-1 outline-none focus:border-white/30" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Deadline</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
              className="w-full glass rounded-xl px-4 py-3 mt-1 outline-none focus:border-white/30" />
          </div>
        </div>

        <label className="text-xs uppercase tracking-widest text-muted-foreground">Reference link (optional)</label>
        <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="https://…"
          className="w-full glass rounded-xl px-4 py-3 mt-1 mb-6 outline-none focus:border-white/30" />

        <button onClick={submit} disabled={submitting}
          className="w-full bg-primary text-primary-foreground font-semibold rounded-xl py-3 hover:opacity-90 flex items-center justify-center gap-2">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Send request
        </button>
        <p className="text-[11px] text-muted-foreground text-center mt-3">
          You won't be charged until @{pro.username} approves. Payments via Stripe (set up by team).
        </p>
      </div>
    </div>
  );
}
