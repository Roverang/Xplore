import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Briefcase, Calendar, MessageSquare, Shield, Users, Sparkles } from "lucide-react";

import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { ProfileSkeleton, ListSkeleton } from "@/components/Skeleton";
import { OnboardingModal } from "@/components/OnboardingModal";
import { getPlatformState, markNotificationsRead, sendMessage } from "@/lib/api/platform.functions";
import { getStoredSession } from "@/lib/app-session";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard - Xplore" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const [state, setState] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [error, setError] = useState("");
  const session = getStoredSession();

  async function refresh() {
    try {
      const latest = await getPlatformState({ data: { token: session?.token } });
      setState(latest);
    } catch {
      setError("Failed to load dashboard. Please refresh.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // Show onboarding if flagged after sign-up
    if (localStorage.getItem("xplore_onboarding_pending") === "true") {
      setShowOnboarding(true);
    }
  }, []);

  if (!session) {
    return (
      <Shell>
        <section className="surface-card p-8 text-center">
          <h1 className="font-display text-2xl font-bold">Sign in required</h1>
          <p className="text-sm text-muted-foreground mt-2">Your dashboard stores memberships, registrations, applications, messages and notifications.</p>
          <Link to="/auth" className="mt-5 inline-flex rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold">Sign in</Link>
        </section>
      </Shell>
    );
  }

  const admin = state?.admin?.users.find((u: any) => u.role === "admin");

  // Points calculation
  const points =
    (state?.memberships?.length ?? 0) * 100 +
    (state?.registrations?.length ?? 0) * 150 +
    (state?.applications?.length ?? 0) * 200;

  return (
    <Shell>
      {showOnboarding && session && (
        <OnboardingModal
          token={session.token}
          onComplete={() => {
            setShowOnboarding(false);
            void refresh();
          }}
        />
      )}

      {error && (
        <div className="mb-6 rounded-xl bg-destructive/10 text-destructive p-4 flex items-center justify-between">
          <p className="text-sm">{error}</p>
          <button onClick={() => { setError(""); void refresh(); }} className="text-xs font-semibold underline">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          {loading ? (
            <ProfileSkeleton />
          ) : (
            <section className="surface-card p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent-gold grid place-items-center text-white text-sm font-bold">
                  {session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h1 className="font-display text-2xl font-extrabold">Hi, {session.user.name} 👋</h1>
                  <p className="text-sm text-muted-foreground">{session.user.email} · <span className="capitalize">{session.user.role}</span></p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-gold-soft">
                    <Sparkles className="h-3.5 w-3.5 text-accent-gold" />
                    <span className="text-xs font-bold text-accent-gold">{points} XP</span>
                  </div>
                  {session.user.role === "admin" && (
                    <Link to="/admin" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold">
                      <Shield className="h-3.5 w-3.5" /> Admin
                    </Link>
                  )}
                </div>
              </div>
            </section>
          )}

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Metric icon={<Users className="h-4 w-4" />} label="Clubs joined" value={state?.memberships?.length ?? 0} loading={loading} />
            <Metric icon={<Calendar className="h-4 w-4" />} label="Registrations" value={state?.registrations?.length ?? 0} loading={loading} />
            <Metric icon={<Briefcase className="h-4 w-4" />} label="Applications" value={state?.applications?.length ?? 0} loading={loading} />
          </section>

          {/* Applications */}
          <section className="surface-card p-6">
            <h2 className="font-display text-lg font-bold mb-4">Applications</h2>
            {loading ? (
              <ListSkeleton rows={3} />
            ) : state?.applications?.length ? (
              <div className="space-y-3">
                {state.applications.map((a: any) => {
                  const opp = state.opportunities?.find((o: any) => o.id === a.opportunityId);
                  return (
                    <div key={a.id} className="rounded-xl border border-border p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {opp?.image && <img src={opp.image} alt={opp.org} className="h-9 w-9 rounded-lg object-cover shrink-0" />}
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{opp?.title ?? a.opportunityId}</div>
                          <div className="text-xs text-muted-foreground">{opp?.org} · {new Date(a.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold shrink-0 ${
                        a.status === "accepted" ? "bg-success-soft text-success" :
                        a.status === "rejected" ? "bg-destructive/10 text-destructive" :
                        a.status === "reviewing" ? "bg-info-soft text-info" :
                        "bg-accent-gold-soft text-accent-gold"
                      }`}>{a.status}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No applications yet.</p>
                <Link to="/search" search={{ q: "", type: "opportunities", category: "" }} className="mt-2 inline-block text-xs text-primary font-semibold hover:underline">Browse opportunities →</Link>
              </div>
            )}
          </section>

          {/* Registrations */}
          <section className="surface-card p-6">
            <h2 className="font-display text-lg font-bold mb-4">My Events</h2>
            {loading ? (
              <ListSkeleton rows={2} />
            ) : state?.registrations?.length ? (
              <div className="space-y-3">
                {state.registrations.map((r: any) => {
                  const ev = state.events?.find((e: any) => e.id === r.eventId);
                  return (
                    <Link key={r.id} to="/events/$eventId" params={{ eventId: r.eventId }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition border border-border">
                      {ev?.image && <img src={ev.image} alt={ev.name} className="h-9 w-9 rounded-lg object-cover shrink-0" />}
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">{ev?.name ?? r.eventId}</div>
                        <div className="text-xs text-muted-foreground">{ev?.date} · {ev?.venue}</div>
                      </div>
                      <span className="ml-auto text-xs font-semibold px-2 py-1 rounded-full bg-success-soft text-success shrink-0">Registered</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No event registrations yet.</p>
                <Link to="/search" search={{ q: "", type: "events", category: "" }} className="mt-2 inline-block text-xs text-primary font-semibold hover:underline">Browse events →</Link>
              </div>
            )}
          </section>

          {/* Messages */}
          <section className="surface-card p-6">
            <h2 className="font-display text-lg font-bold mb-4">Messages</h2>
            {loading ? (
              <ListSkeleton rows={2} />
            ) : (
              <div className="space-y-3">
                {state?.messages?.map((m: any) => (
                  <div key={m.id} className="rounded-xl border border-border p-3 text-sm">
                    <div>{m.body}</div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
            {admin && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await sendMessage({ data: { token: session.token, toUserId: admin.id, body: message } });
                  setMessage("");
                  await refresh();
                }}
                className="mt-4 flex gap-2"
              >
                <input value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="Message campus admin..." className="min-w-0 flex-1 h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none" />
                <button className="rounded-full bg-primary text-primary-foreground px-4 text-xs font-semibold">Send</button>
              </form>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          {/* Notifications */}
          <section className="surface-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-bold">Notifications</h2>
              <button
                onClick={async () => {
                  await markNotificationsRead({ data: { token: session.token } });
                  await refresh();
                }}
                className="ml-auto text-xs text-primary font-semibold hover:underline"
              >
                Mark read
              </button>
            </div>
            {loading ? (
              <ListSkeleton rows={3} />
            ) : state?.notifications?.length ? (
              <div className="space-y-3">
                {state.notifications.map((n: any) => (
                  <div key={n.id} className={`rounded-xl border border-border p-3 transition ${n.read ? "" : "bg-primary-soft/40 border-primary/20"}`}>
                    <div className="font-semibold text-sm">{n.title}</div>
                    <p className="text-xs text-muted-foreground mt-1">{n.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
            )}
          </section>

          {/* Quick Links */}
          <section className="surface-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-bold">Quick Actions</h2>
            </div>
            <div className="space-y-2">
              {[
                { label: "Browse Clubs", to: "/search?type=clubs" },
                { label: "Upcoming Events", to: "/search?type=events" },
                { label: "Find Opportunities", to: "/search?type=opportunities" },
                { label: "My Profile", to: "/profile" },
              ].map(({ label, to }) => (
                <a key={label} href={to} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary text-sm font-medium transition">
                  {label}
                  <span className="text-muted-foreground">→</span>
                </a>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <TopBar />
        <main className="px-6 lg:px-10 py-6 max-w-[1600px] mx-auto">{children}</main>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, loading }: { icon: React.ReactNode; label: string; value: number; loading?: boolean }) {
  if (loading) {
    return (
      <div className="surface-card p-5 animate-pulse">
        <div className="h-9 w-9 rounded-xl bg-secondary" />
        <div className="mt-3 h-7 w-12 rounded-lg bg-secondary" />
        <div className="mt-1 h-3 w-20 rounded bg-secondary" />
      </div>
    );
  }
  return (
    <div className="surface-card p-5">
      <div className="h-9 w-9 rounded-xl bg-primary-soft text-primary grid place-items-center">{icon}</div>
      <div className="mt-3 font-display text-2xl font-extrabold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
