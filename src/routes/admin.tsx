import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Briefcase, Calendar, Database, Shield, Users, Bell, ChevronDown,
  Check, X, Megaphone, UserCog, BarChart3, ClipboardList,
} from "lucide-react";

import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { ListSkeleton } from "@/components/Skeleton";
import {
  createAdminItem,
  getPlatformState,
  updateApplicationStatus,
  updateUserRole,
  broadcastNotification,
} from "@/lib/api/platform.functions";
import { getStoredSession } from "@/lib/app-session";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin - Xplore" }] }),
  component: AdminPage,
});

type Tab = "overview" | "users" | "events" | "opportunities" | "applications" | "broadcast";

function AdminPage() {
  const session = getStoredSession();
  const [state, setState] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [feedback, setFeedback] = useState("");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");

  async function refresh() {
    try {
      const s = await getPlatformState({ data: { token: session?.token } });
      setState(s);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  function flash(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3000);
  }

  if (!session || (session.user.role !== "admin" && session.user.role !== "club_admin")) {
    return (
      <Shell>
        <section className="surface-card p-8 text-center">
          <Shield className="h-10 w-10 mx-auto text-primary" />
          <h1 className="mt-3 font-display text-2xl font-bold">Admin access required</h1>
          <p className="text-sm text-muted-foreground mt-2">Sign in with admin@nitj.ac.in / admin123</p>
          <Link to="/auth" className="mt-5 inline-flex rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold">Sign in</Link>
        </section>
      </Shell>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
    { id: "applications", label: "Applications", icon: <ClipboardList className="h-4 w-4" /> },
    { id: "events", label: "Create Event", icon: <Calendar className="h-4 w-4" /> },
    { id: "opportunities", label: "Create Opportunity", icon: <Briefcase className="h-4 w-4" /> },
    { id: "broadcast", label: "Broadcast", icon: <Megaphone className="h-4 w-4" /> },
  ];

  return (
    <Shell>
      {/* Header */}
      <section className="surface-card p-6 mb-6">
        <div className="flex items-center gap-3">
          <span className="h-11 w-11 rounded-xl bg-primary-soft text-primary grid place-items-center">
            <Database className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold">Xplore Admin</h1>
            <p className="text-sm text-muted-foreground">Manage users, events, opportunities and applications</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              tab === t.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-primary-soft"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {feedback && (
        <div className="mb-6 rounded-xl bg-success-soft text-success p-3 text-sm font-semibold flex items-center gap-2">
          <Check className="h-4 w-4" /> {feedback}
        </div>
      )}

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Metric icon={<Users className="h-4 w-4" />} label="Users" value={state?.admin?.users?.length ?? 0} />
            <Metric icon={<Calendar className="h-4 w-4" />} label="Events" value={state?.events?.length ?? 0} />
            <Metric icon={<Briefcase className="h-4 w-4" />} label="Opportunities" value={state?.opportunities?.length ?? 0} />
            <Metric icon={<ClipboardList className="h-4 w-4" />} label="Registrations" value={state?.admin?.registrations?.length ?? 0} />
            <Metric icon={<Briefcase className="h-4 w-4" />} label="Applications" value={state?.admin?.applications?.length ?? 0} />
          </div>
          <section className="surface-card p-6">
            <h2 className="font-display text-lg font-bold mb-3">Platform at a Glance</h2>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-xl bg-secondary space-y-1">
                <div className="text-xs text-muted-foreground">Latest user</div>
                <div className="font-semibold">{state?.admin?.users?.at(-1)?.name ?? "—"}</div>
              </div>
              <div className="p-4 rounded-xl bg-secondary space-y-1">
                <div className="text-xs text-muted-foreground">Pending applications</div>
                <div className="font-semibold">{state?.admin?.applications?.filter((a: any) => a.status === "submitted")?.length ?? 0}</div>
              </div>
              <div className="p-4 rounded-xl bg-secondary space-y-1">
                <div className="text-xs text-muted-foreground">Acceptance rate</div>
                <div className="font-semibold">
                  {state?.admin?.applications?.length
                    ? `${Math.round((state.admin.applications.filter((a: any) => a.status === "accepted").length / state.admin.applications.length) * 100)}%`
                    : "—"}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Users Tab */}
      {tab === "users" && (
        <section className="surface-card p-6">
          <h2 className="font-display text-lg font-bold mb-4">All Users ({state?.admin?.users?.length ?? 0})</h2>
          {loading ? <ListSkeleton rows={5} /> : (
            <div className="space-y-3">
              {state?.admin?.users?.map((u: any) => (
                <div key={u.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-border">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent-gold grid place-items-center text-white text-xs font-bold shrink-0">
                    {u.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  <select
                    value={u.role}
                    onChange={async (e) => {
                      await updateUserRole({ data: { token: session.token, targetUserId: u.id, role: e.target.value as any } });
                      flash(`Role updated for ${u.name}`);
                      await refresh();
                    }}
                    className="text-xs rounded-full border border-border bg-card px-3 py-1.5 focus:outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="club_admin">Club Admin</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Applications Tab */}
      {tab === "applications" && (
        <section className="surface-card p-6">
          <h2 className="font-display text-lg font-bold mb-4">All Applications ({state?.admin?.applications?.length ?? 0})</h2>
          {loading ? <ListSkeleton rows={5} /> : (
            <div className="space-y-3">
              {state?.admin?.applications?.length ? state.admin.applications.map((a: any) => {
                const user = state.admin?.users?.find((u: any) => u.id === a.userId);
                const opp = state.opportunities?.find((o: any) => o.id === a.opportunityId);
                return (
                  <div key={a.id} className="rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {opp?.image && <img src={opp.image} alt={opp.org} className="h-9 w-9 rounded-lg object-cover shrink-0" />}
                      <div className="min-w-0">
                        <div className="font-semibold text-sm">{user?.name} → {opp?.title}</div>
                        <div className="text-xs text-muted-foreground">{opp?.org} · {new Date(a.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={a.status}
                        onChange={async (e) => {
                          await updateApplicationStatus({ data: { token: session.token, applicationId: a.id, status: e.target.value as any } });
                          flash("Application status updated — student notified");
                          await refresh();
                        }}
                        className="text-xs rounded-full border border-border bg-card px-3 py-1.5 focus:outline-none"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                );
              }) : <p className="text-sm text-muted-foreground">No applications yet.</p>}
            </div>
          )}
        </section>
      )}

      {/* Create Event Tab */}
      {tab === "events" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AdminForm
            title="Create Event"
            fields={[
              { name: "name", label: "Event Name", type: "text" },
              { name: "clubId", label: "Club ID (e.g. aavishkar)", type: "text" },
              { name: "venue", label: "Venue", type: "text" },
              { name: "date", label: "Date (e.g. 15 Jul 2026)", type: "text" },
              { name: "time", label: "Time (e.g. 10:00 AM)", type: "text" },
              { name: "tag", label: "Tag (Tech/Cultural/Business...)", type: "text" },
              { name: "fee", label: "Fee (Free or ₹amount)", type: "text" },
              { name: "capacity", label: "Capacity", type: "number" },
              { name: "about", label: "Description", type: "textarea" },
            ]}
            onSubmit={async (payload) => {
              await createAdminItem({ data: { token: session.token, kind: "event", payload } });
              flash("Event created successfully!");
              await refresh();
            }}
          />
          <section className="surface-card p-6">
            <h2 className="font-display text-lg font-bold mb-4">Existing Events ({state?.events?.length ?? 0})</h2>
            <div className="space-y-2 overflow-y-auto max-h-96">
              {state?.events?.map((e: any) => (
                <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary">
                  {e.image && <img src={e.image} alt={e.name} className="h-8 w-8 rounded-lg object-cover shrink-0" />}
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{e.name}</div>
                    <div className="text-xs text-muted-foreground">{e.date} · {e.registered}/{e.capacity}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Create Opportunity Tab */}
      {tab === "opportunities" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AdminForm
            title="Create Opportunity"
            fields={[
              { name: "title", label: "Title", type: "text" },
              { name: "org", label: "Organization", type: "text" },
              { name: "type", label: "Type (Internship/Part-time/Volunteer...)", type: "text" },
              { name: "stipend", label: "Stipend", type: "text" },
              { name: "location", label: "Location", type: "text" },
              { name: "duration", label: "Duration", type: "text" },
              { name: "about", label: "Description", type: "textarea" },
            ]}
            onSubmit={async (payload) => {
              await createAdminItem({ data: { token: session.token, kind: "opportunity", payload } });
              flash("Opportunity created successfully!");
              await refresh();
            }}
          />
          <section className="surface-card p-6">
            <h2 className="font-display text-lg font-bold mb-4">Existing Opportunities ({state?.opportunities?.length ?? 0})</h2>
            <div className="space-y-2 overflow-y-auto max-h-96">
              {state?.opportunities?.map((o: any) => (
                <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary">
                  {o.image && <img src={o.image} alt={o.org} className="h-8 w-8 rounded-lg object-cover shrink-0" />}
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{o.title}</div>
                    <div className="text-xs text-muted-foreground">{o.org} · {o.stipend}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Broadcast Tab */}
      {tab === "broadcast" && (
        <section className="surface-card p-6 max-w-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-10 w-10 rounded-xl bg-primary-soft text-primary grid place-items-center">
              <Megaphone className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold">Broadcast Notification</h2>
              <p className="text-xs text-muted-foreground">Send a notification to all {state?.admin?.users?.length ?? 0} users</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</label>
              <input
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Applications now open for Hackathon 2026"
                className="mt-1.5 w-full h-11 px-4 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</label>
              <textarea
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                rows={3}
                placeholder="Write your message here..."
                className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-secondary text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <button
              onClick={async () => {
                if (!broadcastTitle || !broadcastBody) return;
                const result = await broadcastNotification({ data: { token: session.token, title: broadcastTitle, body: broadcastBody } });
                flash(`Broadcast sent to ${(result as any).sent} users!`);
                setBroadcastTitle("");
                setBroadcastBody("");
              }}
              disabled={!broadcastTitle || !broadcastBody}
              className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
            >
              Send to All Users
            </button>
          </div>
        </section>
      )}
    </Shell>
  );
}

type FieldDef = { name: string; label: string; type: "text" | "number" | "textarea" };

function AdminForm({ title, fields, onSubmit }: { title: string; fields: FieldDef[]; onSubmit: (payload: Record<string, string>) => Promise<void> }) {
  const [saving, setSaving] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        const form = new FormData(e.currentTarget);
        const payload = Object.fromEntries(fields.map((f) => [f.name, String(form.get(f.name) || "")]));
        await onSubmit(payload);
        (e.target as HTMLFormElement).reset();
        setSaving(false);
      }}
      className="surface-card p-6 space-y-4"
    >
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {fields.map((field) =>
          field.type === "textarea" ? (
            <div key={field.name} className="sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">{field.label}</label>
              <textarea
                name={field.name}
                rows={3}
                required
                className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-card text-sm resize-none focus:outline-none"
              />
            </div>
          ) : (
            <div key={field.name}>
              <label className="text-xs font-semibold text-muted-foreground">{field.label}</label>
              <input
                name={field.name}
                type={field.type}
                required={field.name !== "fee"}
                className="mt-1 w-full h-10 px-3 rounded-xl border border-border bg-card text-sm focus:outline-none"
              />
            </div>
          )
        )}
      </div>
      <button disabled={saving} className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold disabled:opacity-60 hover:opacity-90 transition">
        {saving ? "Saving..." : "Save"}
      </button>
    </form>
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

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="surface-card p-4">
      <div className="h-9 w-9 rounded-xl bg-primary-soft text-primary grid place-items-center">{icon}</div>
      <div className="mt-3 font-display text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
