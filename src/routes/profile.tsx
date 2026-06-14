import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Briefcase, Calendar, Edit2, Save, Users, X, Sparkles, Star } from "lucide-react";

import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { ProfileSkeleton } from "@/components/Skeleton";
import { getPlatformState, updateProfile } from "@/lib/api/platform.functions";
import { getStoredSession } from "@/lib/app-session";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile — Xplore" }] }),
  component: ProfilePage,
});

const BADGE_THRESHOLDS = [
  { key: "first_club", label: "Club Member", icon: "🏛️", desc: "Joined your first club", req: (s: any) => s.memberships?.length >= 1 },
  { key: "event_goer", label: "Event Goer", icon: "🎟️", desc: "Registered for an event", req: (s: any) => s.registrations?.length >= 1 },
  { key: "go_getter", label: "Go-Getter", icon: "🚀", desc: "Applied for an opportunity", req: (s: any) => s.applications?.length >= 1 },
  { key: "multi_club", label: "Multi-Clubber", icon: "⭐", desc: "Joined 3+ clubs", req: (s: any) => s.memberships?.length >= 3 },
  { key: "networker", label: "Networker", icon: "🤝", desc: "Sent your first message", req: (s: any) => s.messages?.length >= 1 },
  { key: "achiever", label: "Top Achiever", icon: "🏆", desc: "Applied to 3+ opportunities", req: (s: any) => s.applications?.length >= 3 },
];

function InitialsAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-20 w-20 text-2xl" : "h-12 w-12 text-sm";
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-primary to-accent-gold grid place-items-center text-white font-bold`}>
      {initials}
    </div>
  );
}

function ProfilePage() {
  const session = getStoredSession();
  const navigate = useNavigate();
  const [state, setState] = useState<any>();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", interests: "", skills: "" });
  const [saved, setSaved] = useState(false);

  async function refresh() {
    const latest = await getPlatformState({ data: { token: session?.token } });
    setState(latest);
    if (latest?.user) {
      setForm({
        name: latest.user.name ?? "",
        bio: latest.user.bio ?? "",
        interests: (latest.user.interests ?? []).join(", "),
        skills: (latest.user.skills ?? []).join(", "),
      });
    }
  }

  useEffect(() => {
    if (!session) { void navigate({ to: "/auth" }); return; }
    void refresh();
  }, []);

  if (!session) return null;

  const user = state?.user;
  const earnedBadges = state ? BADGE_THRESHOLDS.filter((b) => b.req(state)) : [];

  const points =
    (state?.memberships?.length ?? 0) * 100 +
    (state?.registrations?.length ?? 0) * 150 +
    (state?.applications?.length ?? 0) * 200;

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile({
        data: {
          token: session!.token,
          name: form.name || undefined,
          bio: form.bio,
          interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean),
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        },
      });
      setEditing(false);
      setSaved(true);
      await refresh();
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <TopBar />
        <main className="px-6 lg:px-10 py-8 max-w-4xl mx-auto space-y-6">
          {/* Profile Card */}
          {!state ? (
            <ProfileSkeleton />
          ) : (
            <section className="surface-card p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <InitialsAvatar name={user?.name ?? "?"} size="lg" />
                <div className="flex-1 min-w-0">
                  {editing ? (
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="font-display text-2xl font-extrabold bg-transparent border-b-2 border-primary focus:outline-none w-full mb-1"
                    />
                  ) : (
                    <h1 className="font-display text-2xl sm:text-3xl font-extrabold">{user?.name}</h1>
                  )}
                  <p className="text-sm text-muted-foreground">{user?.email} · <span className="capitalize">{user?.role}</span></p>
                  <div className="mt-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent-gold" />
                    <span className="text-sm font-bold text-accent-gold">{points} XP</span>
                    <span className="text-xs text-muted-foreground">· {earnedBadges.length} badges</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {editing ? (
                    <>
                      <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold disabled:opacity-60">
                        <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save"}
                      </button>
                      <button onClick={() => setEditing(false)} className="h-8 w-8 rounded-full border border-border hover:bg-secondary grid place-items-center">
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-full border border-border hover:bg-secondary px-4 py-2 text-xs font-semibold">
                      <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="mt-6">
                {editing ? (
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={3}
                    placeholder="Write a short bio about yourself..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {user?.bio || "No bio yet. Click Edit Profile to add one!"}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="mt-5 space-y-3">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Interests</div>
                  {editing ? (
                    <input value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} placeholder="Technology, Music, Coding..." className="w-full h-10 px-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none" />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(user?.interests ?? []).length > 0 ? user.interests.map((i: string) => (
                        <span key={i} className="text-xs font-semibold px-3 py-1 rounded-full bg-primary-soft text-primary">{i}</span>
                      )) : <span className="text-xs text-muted-foreground">None yet</span>}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Skills</div>
                  {editing ? (
                    <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, Python, Design..." className="w-full h-10 px-3 rounded-xl border border-border bg-secondary text-sm focus:outline-none" />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(user?.skills ?? []).length > 0 ? user.skills.map((s: string) => (
                        <span key={s} className="text-xs font-semibold px-3 py-1 rounded-full bg-accent-gold-soft text-accent-gold">{s}</span>
                      )) : <span className="text-xs text-muted-foreground">None yet</span>}
                    </div>
                  )}
                </div>
              </div>

              {saved && (
                <div className="mt-4 rounded-xl bg-success-soft text-success p-3 text-sm font-semibold">
                  ✓ Profile updated successfully!
                </div>
              )}
            </section>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Users, label: "Clubs Joined", value: state?.memberships?.length ?? 0, tone: "primary" as const },
              { icon: Calendar, label: "Events", value: state?.registrations?.length ?? 0, tone: "success" as const },
              { icon: Briefcase, label: "Applications", value: state?.applications?.length ?? 0, tone: "gold" as const },
            ].map(({ icon: Icon, label, value, tone }) => (
              <div key={label} className="surface-card p-5">
                <div className={`h-9 w-9 rounded-xl ${tone === "primary" ? "bg-primary-soft text-primary" : tone === "success" ? "bg-success-soft text-success" : "bg-accent-gold-soft text-accent-gold"} grid place-items-center`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="mt-3 font-display text-2xl font-extrabold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>

          {/* Badges */}
          <section className="surface-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-4 w-4 text-accent-gold" />
              <h2 className="font-display text-lg font-bold">Badges & Achievements</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BADGE_THRESHOLDS.map((badge) => {
                const earned = earnedBadges.some((b) => b.key === badge.key);
                return (
                  <div key={badge.key} className={`p-4 rounded-xl border text-center transition ${earned ? "border-accent-gold/30 bg-accent-gold-soft" : "border-border opacity-40"}`}>
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <div className="font-semibold text-xs">{badge.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{badge.desc}</div>
                    {earned && <Star className="h-3 w-3 text-accent-gold mx-auto mt-2" />}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Joined Clubs */}
          {state?.memberships?.length > 0 && (
            <section className="surface-card p-6">
              <h2 className="font-display text-lg font-bold mb-4">My Clubs</h2>
              <div className="space-y-3">
                {state.memberships.map((m: any) => {
                  const club = state.clubs?.find((c: any) => c.id === m.clubId);
                  if (!club) return null;
                  return (
                    <Link key={m.id} to="/clubs/$clubId" params={{ clubId: club.id }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition">
                      {club.image ? (
                        <img src={club.image} alt={club.name} className="h-10 w-10 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-primary-soft shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{club.name}</div>
                        <div className="text-xs text-muted-foreground">{club.category} · {m.role}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
