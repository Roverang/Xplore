import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, MessageSquare, Search, ChevronDown, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { clearStoredSession } from "@/lib/app-session";
import { useSession } from "@/lib/use-session";

export function TopBar() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const session = useSession();

  return (
    <header className="sticky top-0 z-30 bg-background/85 backdrop-blur border-b border-border">
      <div className="flex items-center gap-4 px-6 py-3 pl-16 lg:pl-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/search", search: { q, type: "all", category: "" } });
          }}
          className="relative flex-1 max-w-2xl"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-full bg-secondary border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            placeholder="Search clubs, events, opportunities..."
          />
        </form>
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/search"
            search={{ q: "", type: "all", category: "" }}
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary px-3 py-2 rounded-full hover:bg-primary-soft transition"
          >
            Advanced search
          </Link>
          <Link to="/dashboard" className="relative h-10 w-10 rounded-full bg-secondary hover:bg-primary-soft grid place-items-center transition">
            <Bell className="h-[18px] w-[18px] text-foreground" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold grid place-items-center">3</span>
          </Link>
          <Link to="/dashboard" className="h-10 w-10 rounded-full bg-secondary hover:bg-primary-soft grid place-items-center transition">
            <MessageSquare className="h-[18px] w-[18px]" />
          </Link>
          <ThemeToggle />
          {session ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-secondary hover:bg-primary-soft transition"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent-gold grid place-items-center text-white text-xs font-bold">
                  {session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-semibold hidden sm:inline">Hi, {session.user.name.split(" ")[0]}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-12 z-20 w-48 rounded-2xl bg-card border border-border shadow-elevated p-1 animate-fade-up">
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm hover:bg-secondary transition"
                    >
                      <User className="h-4 w-4" /> My Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm hover:bg-secondary transition"
                    >
                      <Bell className="h-4 w-4" /> Dashboard
                    </Link>
                    <div className="my-1 border-t border-border" />
                    <button
                      onClick={() => {
                        clearStoredSession();
                        setMenuOpen(false);
                        void navigate({ to: "/auth" });
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/auth" className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
