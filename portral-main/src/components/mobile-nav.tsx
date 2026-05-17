import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, MessageSquare, User as UserIcon, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function MobileNav() {
  const { user, profile } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (!user) return null;

  const items = [
    { to: "/feed" as const, icon: Home, label: "Feed" },
    { to: "/discover" as const, icon: Compass, label: "Discover" },
    { to: "/messages" as const, icon: MessageSquare, label: "DMs" },
    { to: "/premium" as const, icon: Sparkles, label: "Premium" },
  ];

  return (
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-50">
      <div className="glass-strong rounded-2xl flex items-center justify-around py-2">
        {items.map((it) => {
          const Icon = it.icon;
          const active = path === it.to;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{it.label}</span>
            </Link>
          );
        })}
        {profile && (
          <Link
            to="/p/$username"
            params={{ username: profile.username }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
              path.startsWith("/p/") ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px]">Me</span>
          </Link>
        )}
      </div>
    </div>
  );
}
