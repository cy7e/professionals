import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Professionals" }] }),
  component: Settings,
});

function Settings() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    display_name: "", bio: "", profession: "", skills: "",
    instagram_url: "", youtube_url: "", github_url: "", website_url: "", discord_url: "", twitter_url: "",
    accent_color: "#ffffff", banner_url: "", avatar_url: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!profile) return;
    supabase.from("profiles").select("*").eq("id", profile.id).single().then(({ data }) => {
      if (!data) return;
      setForm({
        display_name: data.display_name ?? "",
        bio: data.bio ?? "",
        profession: data.profession ?? "",
        skills: (data.skills ?? []).join(", "),
        instagram_url: data.instagram_url ?? "",
        youtube_url: data.youtube_url ?? "",
        github_url: data.github_url ?? "",
        website_url: data.website_url ?? "",
        discord_url: data.discord_url ?? "",
        twitter_url: data.twitter_url ?? "",
        accent_color: data.accent_color ?? "#ffffff",
        banner_url: data.banner_url ?? "",
        avatar_url: data.avatar_url ?? "",
      });
    });
  }, [profile]);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: form.display_name || null,
      bio: form.bio || null,
      profession: form.profession || null,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 12),
      instagram_url: form.instagram_url || null,
      youtube_url: form.youtube_url || null,
      github_url: form.github_url || null,
      website_url: form.website_url || null,
      discord_url: form.discord_url || null,
      twitter_url: form.twitter_url || null,
      accent_color: form.accent_color || null,
      banner_url: form.banner_url || null,
      avatar_url: form.avatar_url || null,
    }).eq("id", profile.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    await refreshProfile();
    toast.success("Saved.");
  };

  if (loading || !profile) return <div className="py-20 text-center text-muted-foreground"><Loader2 className="w-5 h-5 mx-auto animate-spin" /></div>;

  const field = (k: keyof typeof form, label: string, props: any = {}) => (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
        className="w-full glass rounded-xl px-4 py-3 mt-1 outline-none focus:border-white/30" {...props} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Settings</h1>
      <div className="glass-card rounded-3xl p-6 md:p-8 space-y-4">
        {field("display_name", "Display name", { maxLength: 60 })}
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Bio</label>
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
            maxLength={300} rows={3}
            className="w-full glass rounded-xl px-4 py-3 mt-1 outline-none resize-none focus:border-white/30" />
        </div>
        {field("profession", "Profession")}
        {field("skills", "Skills (comma separated)")}
        {field("avatar_url", "Avatar URL")}
        {field("banner_url", "Banner URL")}
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Accent color</label>
          <input type="color" value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
            className="w-full glass rounded-xl mt-1 h-12 cursor-pointer" />
        </div>

        <div className="pt-2 border-t border-white/5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Social</p>
          <div className="space-y-3">
            {field("instagram_url", "Instagram URL")}
            {field("youtube_url", "YouTube URL")}
            {field("github_url", "GitHub URL")}
            {field("discord_url", "Discord URL")}
            {field("twitter_url", "X / Twitter URL")}
            {field("website_url", "Website URL")}
          </div>
        </div>

        <button onClick={save} disabled={saving}
          className="w-full bg-primary text-primary-foreground font-semibold rounded-xl py-3 hover:opacity-90 flex items-center justify-center gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
        </button>
      </div>
    </div>
  );
}
