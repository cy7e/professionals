import { createFileRoute, Link } from "@tanstack/react-router";
import { SEED_PROS } from "@/lib/seed-pros";
import { ArrowRight, Sparkles, MessageSquare, Compass, Briefcase } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Professionals — A Social Media for Professionals" },
      { name: "description", content: "Portfolios, hiring, messaging, and the social network engineered for creative professionals." },
      { property: "og:title", content: "Professionals" },
      { property: "og:description", content: "A Social Media for Professionals." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative px-4 md:px-8 pt-12 md:pt-24 pb-24 overflow-hidden">
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-white/5 rounded-full blur-[140px] animate-glow pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-[160px] animate-glow pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Now in early access
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tighter text-gradient mb-6 leading-[0.95]">
            Professionals.
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            A social media for professionals. Build a portfolio, get hired, message clients, and grow alongside the world's best creators.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/signup" className="w-full sm:w-auto px-7 py-3.5 bg-primary text-primary-foreground font-semibold rounded-2xl hover:shadow-[0_0_40px_oklch(1_0_0_/_0.2)] transition-all flex items-center justify-center gap-2">
              Get started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/discover" className="w-full sm:w-auto px-7 py-3.5 glass rounded-2xl font-semibold hover:bg-white/8 transition-all">
              Explore feed
            </Link>
          </div>
        </div>

        {/* Feature pills */}
        <div className="max-w-5xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-up" style={{ animationDelay: "120ms" }}>
          {[
            { icon: Compass, label: "Discover" },
            { icon: Briefcase, label: "Get hired" },
            { icon: MessageSquare, label: "Message" },
            { icon: Sparkles, label: "Premium" },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="glass-card rounded-2xl p-4 flex items-center gap-3 hover-lift">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{f.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured pros */}
      <section className="px-4 md:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Featured professionals</h2>
              <p className="text-sm text-muted-foreground mt-1">Trending creators on the platform</p>
            </div>
            <Link to="/discover" className="text-sm text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SEED_PROS.slice(0, 6).map((p, i) => (
              <Link
                key={p.username}
                to="/p/$username"
                params={{ username: p.username }}
                className="glass-card rounded-2xl p-5 hover-lift hover:border-white/20 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl shrink-0"
                    style={{ background: p.avatar_gradient }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold truncate">{p.display_name}</h3>
                      {p.is_premium && <Sparkles className="w-3 h-3 text-white shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">@{p.username} · {p.profession}</p>
                  </div>
                </div>
                {p.works[0] && (
                  <div
                    className="w-full aspect-video rounded-xl mb-3 border border-white/5"
                    style={{ background: p.works[0].gradient }}
                  />
                )}
                <div className="flex gap-1.5 flex-wrap">
                  {p.skills.slice(0, 3).map((s) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded glass uppercase tracking-wider">{s}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 md:px-8 pb-24">
        <div className="max-w-5xl mx-auto glass-card rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(1_0_0_/_0.06),transparent_60%)] pointer-events-none" />
          <h2 className="relative text-3xl md:text-5xl font-bold tracking-tight mb-4 text-gradient">
            Your portfolio. Their offer.
          </h2>
          <p className="relative text-muted-foreground max-w-md mx-auto mb-8">
            Join thousands of editors, designers, and developers turning craft into clients.
          </p>
          <Link to="/signup" className="relative inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground font-semibold rounded-2xl hover:shadow-[0_0_40px_oklch(1_0_0_/_0.2)] transition-all">
            Create your profile <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
