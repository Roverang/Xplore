import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Medal, Sparkles, Users, Calendar, Briefcase, Star, ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { ListSkeleton } from "@/components/Skeleton";
import { getLeaderboard, getActivityFeed } from "@/lib/api/platform.functions";
import { useSession } from "@/lib/use-session";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — Xplore" }] }),
  component: LeaderboardPage,
});

const RANK_STYLE = [
  "bg-accent-gold text-white shadow-lg",
  "bg-secondary border-2 border-muted-foreground text-foreground",
  "bg-amber-700/20 border-2 border-amber-700/40 text-amber-700",
];

const RANK_ICONS = ["🥇", "🥈", "🥉"];

function InitialsAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-14 w-14 text-xl" : "h-10 w-10 text-sm";
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-primary to-accent-gold grid place-items-center text-white font-bold shrink-0`}>
      {initials}
    </div>
  );
}

function LeaderboardPage() {
  const session = useSession();
  const [entries, setEntries] = useState<{ id: string; name: string; points: number; badges: number }[]>([]);
  const [activity, setActivity] = useState<{ who: string; action: string; target: string; time: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getLeaderboard({ data: {} }).catch(() => []),
      getActivityFeed({ data: {} }).catch(() => []),
    ]).then(([lb, feed]) => {
      setEntries(lb as any);
      setActivity(feed as any);
    }).finally(() => setLoading(false));
  }, []);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <TopBar />
        <main className="px-6 lg:px-10 py-8 max-w-4xl mx-auto space-y-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          {/* Header */}
          <section className="text-center py-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-gold-soft mb-4">
              <Trophy className="h-4 w-4 text-accent-gold" />
              <span className="text-sm font-bold text-accent-gold">Campus Leaderboard</span>
            </div>
            <h1 className="font-display text-4xl font-extrabold">Top Students</h1>
            <p className="text-muted-foreground mt-2 text-sm">Ranked by XP: Club membership (100pt) · Events (150pt) · Opportunities (200pt)</p>
          </section>

          {/* Podium */}
          {loading ? (
            <ListSkeleton rows={3} />
          ) : top3.length > 0 ? (
            <section className="surface-card p-8">
              <div className="flex items-end justify-center gap-4">
                {/* 2nd */}
                {top3[1] && (
                  <div className="flex flex-col items-center gap-3 flex-1">
                    <InitialsAvatar name={top3[1].name} size="md" />
                    <div className="text-center">
                      <div className="font-bold text-sm">{top3[1].name}</div>
                      <div className="text-xs text-muted-foreground">{top3[1].points} XP</div>
                    </div>
                    <div className="w-full h-20 rounded-t-2xl bg-secondary flex items-center justify-center text-3xl">🥈</div>
                  </div>
                )}

                {/* 1st */}
                {top3[0] && (
                  <div className="flex flex-col items-center gap-3 flex-1">
                    <div className="relative">
                      <InitialsAvatar name={top3[0].name} size="lg" />
                      <span className="absolute -top-2 -right-2 text-2xl">👑</span>
                    </div>
                    <div className="text-center">
                      <div className="font-display font-extrabold">{top3[0].name}</div>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <Sparkles className="h-3 w-3 text-accent-gold" />
                        <span className="text-sm font-bold text-accent-gold">{top3[0].points} XP</span>
                      </div>
                    </div>
                    <div className="w-full h-32 rounded-t-2xl bg-gradient-to-t from-accent-gold/30 to-accent-gold-soft flex items-center justify-center text-4xl border-2 border-accent-gold/20">🥇</div>
                  </div>
                )}

                {/* 3rd */}
                {top3[2] && (
                  <div className="flex flex-col items-center gap-3 flex-1">
                    <InitialsAvatar name={top3[2].name} size="md" />
                    <div className="text-center">
                      <div className="font-bold text-sm">{top3[2].name}</div>
                      <div className="text-xs text-muted-foreground">{top3[2].points} XP</div>
                    </div>
                    <div className="w-full h-14 rounded-t-2xl bg-amber-700/10 flex items-center justify-center text-3xl">🥉</div>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <div className="surface-card p-10 text-center text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No leaderboard data yet. Join clubs, attend events & apply for opportunities to earn XP!</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Rankings */}
            <section className="surface-card p-6">
              <h2 className="font-display text-lg font-bold mb-4">Full Rankings</h2>
              {loading ? (
                <ListSkeleton rows={6} />
              ) : entries.length > 0 ? (
                <div className="space-y-2">
                  {entries.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition ${
                        session?.user.name === entry.name ? "bg-primary-soft border border-primary/20" : "hover:bg-secondary"
                      }`}
                    >
                      <div className="h-8 w-8 rounded-full bg-secondary grid place-items-center text-sm font-bold shrink-0">
                        {idx < 3 ? RANK_ICONS[idx] : `#${idx + 1}`}
                      </div>
                      <InitialsAvatar name={entry.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {entry.name}
                          {session?.user.name === entry.name && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">You</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{entry.badges} badges</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Sparkles className="h-3.5 w-3.5 text-accent-gold" />
                        <span className="font-bold text-sm text-accent-gold">{entry.points}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No data yet — start engaging on Xplore to earn XP!</p>
              )}
            </section>

            {/* Activity Feed */}
            <section className="surface-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-4 w-4 text-primary" />
                <h2 className="font-display text-lg font-bold">Live Activity</h2>
              </div>
              {loading ? (
                <ListSkeleton rows={5} />
              ) : activity.length > 0 ? (
                <div className="space-y-3">
                  {activity.slice(0, 10).map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm">
                      <div className="h-7 w-7 rounded-full bg-primary-soft grid place-items-center text-xs font-bold text-primary shrink-0 mt-0.5">
                        {item.who[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold">{item.who}</span>
                        <span className="text-muted-foreground"> {item.action} </span>
                        <span className="font-medium">{item.target}</span>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              )}
            </section>
          </div>

          {/* How XP Works */}
          <section className="surface-card p-6">
            <h2 className="font-display text-lg font-bold mb-4">How XP Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: <Users className="h-5 w-5" />, label: "Join a Club", xp: "+100 XP", tone: "primary" },
                { icon: <Calendar className="h-5 w-5" />, label: "Register for Event", xp: "+150 XP", tone: "success" },
                { icon: <Briefcase className="h-5 w-5" />, label: "Apply to Opportunity", xp: "+200 XP", tone: "gold" },
              ].map(({ icon, label, xp, tone }) => (
                <div key={label} className="flex items-center gap-3 p-4 rounded-xl bg-secondary">
                  <div className={`h-10 w-10 rounded-xl grid place-items-center ${
                    tone === "primary" ? "bg-primary-soft text-primary" :
                    tone === "success" ? "bg-success-soft text-success" :
                    "bg-accent-gold-soft text-accent-gold"
                  }`}>
                    {icon}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{label}</div>
                    <div className={`text-xs font-bold ${tone === "gold" ? "text-accent-gold" : tone === "success" ? "text-success" : "text-primary"}`}>{xp}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
