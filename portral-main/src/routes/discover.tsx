import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SEED_PROS, SEED_FEED_TAGS } from "@/lib/seed-pros";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Search, Sparkles, Lock } from "lucide-react";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — Professionals" },
      { name: "description", content: "Discover top creators, editors, designers, and developers." },
    ],
  }),
  component: Discover,
});

type DbProfile = {
  id: string;
  username: string;
  display_name: string | null;
  profession: string | null;
  is_premium: boolean;
  is_verified: boolean;
  is_featured: boolean;
  avatar_url: string | null;
};

function Discover() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTag, setActiveTag] = useState("All");
  const [search, setSearch] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [realFeatured, setRealFeatured] = useState<DbProfile[]>([]);

  // Only show real users that are flagged featured — keeps discovery curated
  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, username, display_name, profession, is_premium, is_verified, is_featured, avatar_url")
      .eq("is_featured", true)
      .limit(12)
      .then(({ data }) => setRealFeatured((data ?? []) as DbProfile[]));
  }, []);

  const onSearch = (v: string) => {
    if (!user && v.length > 2) {
      setShowLogin(true);
      return;
    }
    setSearch(v);
  };

  // Mix real featured + seed
  const allWorks = SEED_PROS.flatMap((p) =>
    p.works.map((w) => ({ ...w, owner: p }))
  );

  const filteredPros = SEED_PROS.filter((p) =>
    activeTag === "All" ? true : p.skills.some((s) => s.toLowerCase().includes(activeTag.toLowerCase())) ||
      p.profession.toLowerCase().includes(activeTag.toLowerCase())
  );

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Discover</h1>
          <p className="text-sm text-muted-foreground mt-1">Top professionals and their latest work.</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={() => !user && setShowLogin(true)}
            placeholder={user ? "Search creators, skills…" : "Sign in to search"}
            className="w-full glass rounded-full pl-10 pr-4 py-2.5 text-sm outline-none focus:border-white/30"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6 -mx-4 px-4 md:mx-0 md:px-0">
        {SEED_FEED_TAGS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTag(t)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm transition-all ${
              activeTag === t ? "bg-primary text-primary-foreground" : "glass hover:bg-white/8"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Login gate */}
      {showLogin && !user && (
        <div className="glass-card rounded-2xl p-6 mb-6 flex items-start gap-4 animate-fade-up">
          <Lock className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Sign in to search deeper</h3>
            <p className="text-sm text-muted-foreground mb-3">Browse curated work without an account. Search across every Professional once you join.</p>
            <div className="flex gap-2">
              <Link to="/signup" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">Join free</Link>
              <Link to="/login" className="px-4 py-2 glass rounded-lg text-sm">Sign in</Link>
              <button onClick={() => setShowLogin(false)} className="px-4 py-2 text-sm text-muted-foreground">Later</button>
            </div>
          </div>
        </div>
      )}

      {/* Featured pros strip */}
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Top professionals</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        {filteredPros.slice(0, 6).map((p, i) => (
          <Link
            key={p.username}
            to="/p/$username"
            params={{ username: p.username }}
            className="glass-card rounded-2xl p-4 hover-lift animate-fade-up text-center"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div
              className="w-16 h-16 mx-auto rounded-full mb-3"
              style={{ background: p.avatar_gradient }}
            />
            <div className="flex items-center justify-center gap-1">
              <p className="text-sm font-semibold truncate">{p.display_name}</p>
              {p.is_premium && <Sparkles className="w-3 h-3 shrink-0" />}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">{p.profession}</p>
          </Link>
        ))}
      </div>

      {/* Works grid (YouTube/Behance vibe) */}
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Trending work</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allWorks.map((w, i) => (
          <Link
            key={`${w.owner.username}-${i}`}
            to="/p/$username"
            params={{ username: w.owner.username }}
            onClick={(e) => {
              if (!user) {
                // Allow viewing the profile freely; only gate deeper search
              }
            }}
            className="group animate-fade-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div
              className="w-full aspect-video rounded-xl border border-white/10 mb-3 overflow-hidden relative group-hover:border-white/30 transition-colors"
              style={{ background: w.gradient }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full shrink-0" style={{ background: w.owner.avatar_gradient }} />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{w.title}</p>
                <p className="text-xs text-muted-foreground truncate">@{w.owner.username} · {w.category}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {realFeatured.length > 0 && (
        <>
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 mt-12">Live on the platform</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {realFeatured.map((p) => (
              <Link key={p.id} to="/p/$username" params={{ username: p.username }} className="glass-card rounded-2xl p-4 hover-lift text-center">
                <div className="w-16 h-16 mx-auto rounded-full mb-3 bg-white/10 overflow-hidden">
                  {p.avatar_url && <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex items-center justify-center gap-1">
                  <p className="text-sm font-semibold truncate">{p.display_name ?? p.username}</p>
                  {p.is_premium && <Sparkles className="w-3 h-3 shrink-0" />}
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{p.profession ?? "Professional"}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
