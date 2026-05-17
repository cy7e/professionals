import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Compass, MessageSquare, Sparkles, User as UserIcon, LogOut, Search } from "lucide-react";
import { useState } from "react";

export function SiteNav() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-3 pt-3 md:px-6 md:pt-4">
      <div className="max-w-7xl mx-auto glass-strong rounded-2xl flex items-center justify-between px-4 md:px-6 py-2.5">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="font-bold tracking-tight text-base md:text-lg">
            PROFESSIONALS
          </Link>
          <div className="hidden md:flex items-center gap-5 text-sm text-muted-foreground">
            <Link to="/discover" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> Discover
            </Link>
            <Link to="/feed" className="hover:text-foreground transition-colors">Feed</Link>
            <Link to="/premium" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Premium
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/messages" className="p-2 rounded-full hover:bg-white/5 transition-colors hidden sm:block">
                <MessageSquare className="w-4 h-4" />
              </Link>
              <div className="relative">
                <button
                  onClick={() => setOpen((v) => !v)}
                  className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-white/5 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-white/10 grid place-items-center text-xs font-medium overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      profile?.username?.[0]?.toUpperCase() ?? "?"
                    )}
                  </div>
                  {profile?.is_premium && <Sparkles className="w-3 h-3 text-white" />}
                </button>
                {open && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-12 z-50 w-56 glass-strong rounded-xl p-2 animate-fade-up">
                      <div className="px-3 py-2 border-b border-white/5 mb-1">
                        <p className="text-sm font-medium truncate">{profile?.display_name ?? profile?.username}</p>
                        <p className="text-xs text-muted-foreground">@{profile?.username}</p>
                      </div>
                      <Link to="/p/$username" params={{ username: profile?.username ?? "" }} onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm">
                        <UserIcon className="w-4 h-4" /> My profile
                      </Link>
                      <Link to="/settings" onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm">
                        Settings
                      </Link>
                      <button
                        onClick={async () => {
                          await signOut();
                          navigate({ to: "/" });
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-left"
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm px-4 py-2 hover:text-foreground text-muted-foreground transition-colors">
                Sign in
              </Link>
              <Link to="/signup" className="text-sm font-semibold px-4 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity">
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
