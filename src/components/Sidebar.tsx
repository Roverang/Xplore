import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Home, Compass, Calendar, Briefcase, ClipboardList,
  Trophy, User, QrCode, Shield, Menu, X,
} from "lucide-react";

const nav = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Explore Clubs", icon: Compass, to: "/search?type=clubs" },
  { label: "Events", icon: Calendar, to: "/search?type=events" },
  { label: "Opportunities", icon: Briefcase, to: "/search?type=opportunities" },
  { label: "My Dashboard", icon: ClipboardList, to: "/dashboard" },
  { label: "Profile", icon: User, to: "/profile" },
  { label: "Leaderboard", icon: Trophy, to: "/leaderboard" },
  { label: "Admin", icon: Shield, to: "/admin" },
];

function SidebarContent() {
  return (
    <>
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary-soft border border-border grid place-items-center text-primary font-bold text-sm">
          NIT
        </div>
        <div className="leading-tight">
          <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">DR B R AMBEDKAR</div>
          <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">NIT JALANDHAR</div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <Link to="/" className="block">
          <h1 className="font-display text-2xl font-extrabold leading-tight">
            <span className="underline decoration-2 decoration-primary underline-offset-4">Xplore-</span>
            <span className="text-primary">The</span>
            <br />
            <span className="underline decoration-2 decoration-primary underline-offset-4">Campus </span>
            <span className="text-accent-gold">OS</span>
          </h1>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {nav.map(({ label, icon: Icon, to }) => (
          <a
            key={label}
            href={to}
            className="group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-sidebar-foreground hover:bg-primary-soft hover:text-primary"
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {label}
          </a>
        ))}
      </nav>

      <div className="m-4 rounded-2xl bg-primary text-primary-foreground p-4">
        <div className="text-sm font-semibold">
          Join our <span className="text-accent-gold">WhatsApp</span> Community
        </div>
        <div className="mt-2 grid grid-cols-[1fr_auto] gap-3 items-center">
          <p className="text-xs text-primary-foreground/80">
            Get early updates on events, opportunities and more!
          </p>
          <div className="h-16 w-16 rounded-lg bg-white grid place-items-center text-primary">
            <QrCode className="h-12 w-12" />
          </div>
        </div>
        <button className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-white/15 hover:bg-white/25 transition px-3 py-2 text-xs font-semibold">
          <span className="h-4 w-4 rounded-full bg-success grid place-items-center text-[10px]">✓</span>
          Scan to Join
        </button>
      </div>
    </>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 h-10 w-10 rounded-xl bg-card border border-border shadow-md grid place-items-center hover:bg-primary-soft transition"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 h-full w-72 bg-sidebar border-r border-sidebar-border flex flex-col shadow-elevated animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-secondary grid place-items-center z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-sidebar-border bg-sidebar h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  );
}

export function MediaSlot({
  label, ratio = "16/9", children, className = "",
}: { label?: string; ratio?: string; children?: ReactNode; className?: string }) {
  return (
    <div className={`media-frame ${className}`} style={{ aspectRatio: ratio }}>
      {children ?? (
        <div className="absolute inset-0 grid place-items-center text-xs font-medium text-primary/60">
          {label ?? "Media slot"}
        </div>
      )}
    </div>
  );
}
