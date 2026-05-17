import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Join — Professionals" }] }),
  component: SignUp,
});

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (username.length < 3) return toast.error("Username must be 3+ characters");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/onboarding",
        data: { username, display_name: username },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created. Check your email to verify.");
    navigate({ to: "/onboarding" });
  };

  const google = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/onboarding" },
    });
    if (error) {
      setLoading(false);
      toast.error("Google sign-in failed");
    }
  };

  return (
    <div className="px-4 py-10 max-w-md mx-auto">
      <div className="glass-card rounded-3xl p-8 animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Become a Professional</h1>
        <p className="text-sm text-muted-foreground mb-6">Create your portfolio in seconds.</p>

        <button onClick={google} disabled={loading} className="w-full glass rounded-xl py-3 font-medium hover:bg-white/8 transition-colors mb-3">
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or email</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder="username" minLength={3} maxLength={30} required
            className="w-full glass rounded-xl px-4 py-3 outline-none focus:border-white/30" />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com" className="w-full glass rounded-xl px-4 py-3 outline-none focus:border-white/30" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (8+ chars)" minLength={8}
            className="w-full glass rounded-xl px-4 py-3 outline-none focus:border-white/30" />
          <button disabled={loading} className="w-full bg-primary text-primary-foreground font-semibold rounded-xl py-3 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Create account
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Already a Professional? <Link to="/login" className="text-foreground underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
