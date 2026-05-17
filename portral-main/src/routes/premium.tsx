import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/premium")({
  head: () => ({
    meta: [
      { title: "Premium — Professionals" },
      { name: "description", content: "Unlock the full Professionals toolkit for $7/month." },
    ],
  }),
  component: Premium,
});

const FEATURES = [
  "Highlighted profile in discovery",
  "Premium badge & animated themes",
  "Portfolio analytics",
  "AI portfolio assistant",
  "Priority hiring placement",
  "Unlimited uploads",
  "Team expansion",
  "Custom profile effects",
  "Early access to new features",
];

function Premium() {
  return (
    <div className="px-4 py-12 max-w-3xl mx-auto">
      <div className="text-center mb-10 animate-fade-up">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass text-xs uppercase tracking-widest mb-4">
          <Sparkles className="w-3 h-3" /> Premium
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gradient">Become unmissable.</h1>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto">Stand out in discovery, unlock AI tools, and get hired more.</p>
      </div>

      <div className="glass-card rounded-3xl p-8 md:p-10 relative overflow-hidden animate-fade-up">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-5xl font-bold">$7</span>
          <span className="text-muted-foreground">/ month</span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Cancel anytime. No commitment.</p>

        <ul className="space-y-2.5 mb-8">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm">
              <Check className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <button
          className="w-full bg-primary text-primary-foreground font-semibold rounded-2xl py-3.5 hover:shadow-[0_0_40px_oklch(1_0_0_/_0.2)] transition-all"
        >
          Upgrade with Stripe
        </button>
        <p className="text-[11px] text-muted-foreground text-center mt-3">
          Stripe checkout activates once payments are connected to the workspace.
        </p>
      </div>
    </div>
  );
}
