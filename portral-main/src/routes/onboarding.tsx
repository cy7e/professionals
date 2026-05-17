import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome — Professionals" }] }),
  component: Onboarding,
});

const PROFESSIONS = [
  "Video Editor", "Thumbnail Designer", "Photographer", "Programmer",
  "Music Producer", "Animator", "Graphic Designer", "YouTuber",
  "Streamer", "Developer", "Writer", "Artist",
];

function Onboarding() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [profession, setProfession] = useState<string>("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !profile) {
    return <div className="px-4 py-20 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>;
  }

  const save = async () => {
    if (!profession) return toast.error("Pick a profession");
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        profession,
        bio,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 8),
      })
      .eq("id", profile.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    await refreshProfile();
    toast.success("Profile created.");
    navigate({ to: "/feed" });
  };

  return (
    <div className="px-4 py-10 max-w-2xl mx-auto">
      <div className="glass-card rounded-3xl p-8 animate-fade-up">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Welcome, @{profile.username}</h1>
        <p className="text-sm text-muted-foreground mb-6">Tell us what you do.</p>

        <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">What kind of professional are you?</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
          {PROFESSIONS.map((p) => (
            <button
              key={p}
              onClick={() => setProfession(p)}
              className={`px-3 py-2.5 rounded-xl text-sm border transition-all ${
                profession === p
                  ? "bg-primary text-primary-foreground border-primary"
                  : "glass hover:bg-white/8 border-white/10"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Short bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={200} rows={3}
          placeholder="One line about your work." className="w-full glass rounded-xl px-4 py-3 outline-none focus:border-white/30 mb-4 resize-none" />

        <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Skills (comma separated)</label>
        <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. After Effects, Color, Sound design"
          className="w-full glass rounded-xl px-4 py-3 outline-none focus:border-white/30 mb-6" />

        <button onClick={save} disabled={saving} className="w-full bg-primary text-primary-foreground font-semibold rounded-xl py-3 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />} Continue
        </button>
      </div>
    </div>
  );
}
