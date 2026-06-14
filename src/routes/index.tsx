import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowRight, Award, Calendar, ChevronRight, MapPin, Megaphone,
  PlayCircle, QrCode, Rocket, Sparkles, Trophy, Users, Briefcase, Activity,
} from "lucide-react";
import { Sidebar, MediaSlot } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Counter } from "@/components/Counter";
import { clubs as allClubs, events as allEvents, opportunities as allOpps } from "@/lib/data";
import { RecommendationsCard } from "@/components/RecommendationsCard";
import { CampusJourneyCard } from "@/components/CampusJourneyCard";
import { AchievementsCard } from "@/components/AchievementsCard";
import { AnnouncementsCard } from "@/components/AnnouncementsCard";
import { Building2, GraduationCap } from "lucide-react";
import { applyToOpportunity, getLeaderboard, getActivityFeed } from "@/lib/api/platform.functions";
import { useSession } from "@/lib/use-session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Xplore — The Campus OS" },
      { name: "description", content: "Connecting clubs, students and brand opportunities. Discover clubs, events and opportunities in one campus OS." },
    ],
  }),
  component: HomePage,
});

const features = [
  { icon: Trophy, title: "Unlock Opportunities & Skill Building", desc: "Internships, workshops and ambassador roles curated for campus talent." },
  { icon: Megaphone, title: "Unify Club Management & Boost Engagement", desc: "Run inductions, events and member updates from one collaborative hub." },
  { icon: Rocket, title: "Reach Targeted Audiences & Generate Verified Leads", desc: "Brands connect with verified students through tracked campaigns." },
];

const stats = [
  { v: 48, label: "Active Clubs", sub: "Explore diverse communities", icon: Users, tone: "primary" as const },
  { v: 120, label: "Events", sub: "Join exciting events on campus", icon: Calendar, tone: "success" as const },
  { v: 75, label: "Opportunities", sub: "Internships, workshops & more", icon: Briefcase, tone: "gold" as const },
  { v: 2100, label: "Students", sub: "Active campus members", icon: Sparkles, tone: "info" as const },
  { v: 15, label: "Brand Partners", sub: "Verified opportunity sponsors", icon: Building2, tone: "primary" as const },
  { v: 5, label: "Partner Colleges", sub: "Across North India", icon: GraduationCap, tone: "gold" as const },
];

const events = allEvents;
const clubs = allClubs;
const opportunities = allOpps;

// Fallback static data (shown while server data loads)
const staticLeaderboard = [
  { rank: 1, name: "Arjun Mehta", points: 4820, badges: 12 },
  { rank: 2, name: "Priya Sharma", points: 4615, badges: 11 },
  { rank: 3, name: "Rohan Verma", points: 4280, badges: 10 },
  { rank: 4, name: "Ananya Singh", points: 3990, badges: 9 },
  { rank: 5, name: "Karan Patel", points: 3705, badges: 8 },
];

const staticActivity = [
  { who: "Rahul", action: "joined", target: "Robotics Club", time: "2m ago" },
  { who: "Priya", action: "attended", target: "AI Bootcamp", time: "8m ago" },
  { who: "Ananya", action: "applied for", target: "Marketing Intern", time: "15m ago" },
  { who: "Aman", action: "earned badge", target: "Club Champion", time: "32m ago" },
  { who: "Vikram", action: "joined", target: "E-Cell", time: "1h ago" },
];

const toneMap = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  gold: "bg-accent-gold-soft text-accent-gold",
  info: "bg-info-soft text-info",
};

function HomePage() {
  const session = useSession();
  const [applicationMessage, setApplicationMessage] = useState("");
  const [leaderboard, setLeaderboard] = useState(staticLeaderboard);
  const [activity, setActivity] = useState(staticActivity);

  useEffect(() => {
    void getLeaderboard({ data: {} }).then((data) => {
      if (data.length > 0) {
        setLeaderboard(data.map((u, i) => ({ rank: i + 1, name: u.name, points: u.points, badges: u.badges })));
      }
    }).catch(() => {});
    void getActivityFeed({ data: {} }).then((data) => {
      if (data.length > 0) setActivity(data);
    }).catch(() => {});
  }, []);

  async function apply(opportunityId: string) {
    if (!session) {
      setApplicationMessage("Please sign in before applying.");
      return;
    }
    try {
      const result = await applyToOpportunity({
        data: { token: session.token, opportunityId, note: "Applied from homepage." },
      });
      setApplicationMessage(`Application saved for ${result.opportunity.title}.`);
    } catch (err) {
      setApplicationMessage(err instanceof Error ? err.message : "Could not apply.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <TopBar />

        <main className="px-6 lg:px-10 py-6 space-y-10 max-w-[1600px] mx-auto">
          {/* HERO */}
          <section className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 animate-fade-up">
            <div className="surface-card overflow-hidden relative">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-8 lg:p-12 relative z-10">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft text-primary px-3 py-1 text-xs font-semibold">
                    <Sparkles className="h-3.5 w-3.5" /> The Campus OS
                  </div>
                  <h2 className="mt-5 font-display text-4xl lg:text-5xl font-extrabold leading-[1.05] text-foreground">
                    Explore. Connect.<br />
                    Let's <span className="text-primary">Xplore</span>
                    <span className="text-accent-gold">!</span>
                  </h2>
                  <p className="mt-4 text-muted-foreground max-w-md">
                    Discover clubs, join exciting events and unlock endless opportunities — all from one campus operating system.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link to="/search" search={{ q: "", type: "clubs", category: "" }} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold shadow-elevated hover:opacity-90 transition">
                      Explore Clubs <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-6 py-3 text-sm font-semibold hover:bg-primary-soft transition">
                      <PlayCircle className="h-4 w-4 text-primary" /> How It Works
                    </Link>
                  </div>
                </div>

                {/* Hero — Club Image Collage */}
                <div className="relative overflow-hidden" style={{ minHeight: "340px" }}>
                  {/* Main background image */}
                  <img
                    src="/images/clubs/pragyan.png"
                    alt="Campus clubs"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-r from-card/70 via-card/10 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/50 via-transparent to-transparent" />

                  {/* Floating club cards */}
                  <div className="absolute top-4 right-3 w-28 rounded-xl overflow-hidden shadow-elevated border-2 border-card/80 animate-float z-10">
                    <img src="/images/clubs/robotics-club.png" alt="Robotics Club" className="w-full object-cover" style={{ height: "72px" }} />
                    <div className="bg-card/95 px-2 py-1.5">
                      <div className="text-[9px] font-bold">Robotics Club</div>
                      <div className="text-[8px] text-muted-foreground">248 members</div>
                    </div>
                  </div>

                  <div className="absolute bottom-16 right-3 w-28 rounded-xl overflow-hidden shadow-elevated border-2 border-card/80 animate-float [animation-delay:1.2s] z-10">
                    <img src="/images/clubs/e-cell.png" alt="E-Cell" className="w-full object-cover" style={{ height: "72px" }} />
                    <div className="bg-card/95 px-2 py-1.5">
                      <div className="text-[9px] font-bold">E-Cell NITJ</div>
                      <div className="text-[8px] text-muted-foreground">312 members</div>
                    </div>
                  </div>

                  {/* Stat chips */}
                  <div className="absolute top-4 left-3 z-10 animate-float [animation-delay:0.5s]">
                    <div className="bg-card/90 backdrop-blur-sm border border-border/60 rounded-2xl shadow-elevated px-3 py-2 flex items-center gap-2">
                      <span className="h-7 w-7 rounded-lg bg-primary-soft text-primary grid place-items-center shrink-0">
                        <Users className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <div className="text-[10px] font-extrabold">48 Clubs</div>
                        <div className="text-[8px] text-muted-foreground">Active on campus</div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-16 left-3 z-10 animate-float [animation-delay:2s]">
                    <div className="bg-card/90 backdrop-blur-sm border border-border/60 rounded-2xl shadow-elevated px-3 py-2 flex items-center gap-2">
                      <span className="h-7 w-7 rounded-lg bg-accent-gold-soft text-accent-gold grid place-items-center shrink-0">
                        <Trophy className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <div className="text-[10px] font-extrabold">Join & Earn XP</div>
                        <div className="text-[8px] text-muted-foreground">+100 per club</div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom strip of 3 club thumbnails */}
                  <div className="absolute bottom-0 left-0 right-0 z-10 flex">
                    {["/images/clubs/geeek-workshop.png", "/images/clubs/octaves.png", "/images/clubs/aavishkar.png"].map((src, i) => (
                      <img key={i} src={src} alt="club" className="flex-1 object-cover opacity-90 hover:opacity-100 transition-opacity" style={{ height: "52px" }} />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-card/50 to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature pill cards */}
            <div className="flex flex-col gap-3">
              {features.map(({ icon: Icon, title, desc }) => (
                <button
                  key={title}
                  className="group text-left rounded-2xl bg-primary text-primary-foreground p-5 flex items-start gap-4 hover:translate-y-[-2px] hover:shadow-elevated transition-all"
                >
                  <div className="h-11 w-11 rounded-xl bg-white/10 grid place-items-center shrink-0">
                    <Icon className="h-5 w-5 text-accent-gold" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm leading-snug">{title}</div>
                    <div className="text-xs text-primary-foreground/70 mt-1">{desc}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </section>

          {/* STATS */}
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map(({ v, label, sub, icon: Icon, tone }) => (
              <div key={label} className="surface-card p-5 flex items-start gap-4 hover:shadow-elevated transition">
                <div className={`h-12 w-12 rounded-full grid place-items-center ${toneMap[tone]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-2xl font-extrabold text-foreground">
                    <Counter value={v} />
                  </div>
                  <div className="text-sm font-semibold">{label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
                </div>
              </div>
            ))}
          </section>

          {/* EVENTS + CLUBS */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="surface-card p-6">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 mb-5">
                <h3 className="font-display text-lg font-bold truncate">Upcoming Events</h3>
                <Link to="/search" search={{ q: "", type: "events", category: "" }} className="text-sm text-primary font-semibold inline-flex items-center gap-1">View All <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
              <div className="space-y-3">
                {events.slice(0, 4).map((e) => (
                  <Link
                    key={e.id}
                    to="/events/$eventId"
                    params={{ eventId: e.id }}
                    className="grid grid-cols-[56px_minmax(0,1fr)_auto] gap-4 items-center p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary-soft/40 transition"
                  >
                    <img src={e.image} alt={e.name} className="h-14 w-14 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{e.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <MapPin className="h-3 w-3" /> {e.venue}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Calendar className="h-3 w-3" /> {e.date} · {e.time}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:opacity-90">
                      Register
                    </span>
                  </Link>
                ))}
              </div>
              <Link to="/search" search={{ q: "", type: "events", category: "" }} className="mt-5 flex justify-center items-center gap-1 text-sm text-primary font-semibold">
                View All Events <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="surface-card p-6">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 mb-5">
                <h3 className="font-display text-lg font-bold truncate">Featured Clubs</h3>
                <Link to="/search" search={{ q: "", type: "clubs", category: "" }} className="text-sm text-primary font-semibold inline-flex items-center gap-1">View All <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {clubs.map((c) => (
                  <Link
                    key={c.id}
                    to="/clubs/$clubId"
                    params={{ clubId: c.id }}
                    className="rounded-xl border border-border p-4 text-center hover:shadow-soft hover:-translate-y-0.5 transition block"
                  >
                    <img src={c.image} alt={c.name} className="h-14 w-14 rounded-full object-cover mx-auto" />
                    <div className="mt-3 font-semibold text-sm truncate">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{c.category}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">{c.members} members</div>
                    <span className="mt-3 block w-full rounded-full bg-primary-soft text-primary text-xs font-semibold py-1.5 hover:bg-primary hover:text-primary-foreground transition">
                      View Club
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* OPPORTUNITIES */}
          <section>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 mb-5">
              <h3 className="font-display text-xl font-bold truncate">Opportunities for you</h3>
              <Link to="/search" search={{ q: "", type: "opportunities", category: "" }} className="text-sm text-primary font-semibold inline-flex items-center gap-1">View All <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
            {applicationMessage && <p className="mb-4 rounded-xl bg-primary-soft text-primary px-4 py-3 text-sm font-semibold">{applicationMessage}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {opportunities.map((o) => (
                <div key={o.title} className="surface-card p-5 hover:shadow-elevated hover:-translate-y-1 transition group">
                  <div className="flex items-start gap-3">
                    {/* Brand logo slot */}
                    <img src={o.image} alt={o.org} className="h-12 w-12 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm truncate">{o.title}</div>
                      <div className="text-xs text-muted-foreground">{o.org}</div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-accent-gold-soft text-accent-gold uppercase tracking-wider shrink-0">
                      {o.type}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Stipend</div>
                      <div className="text-sm font-bold text-foreground">{o.stipend}</div>
                    </div>
                    <button onClick={() => apply(o.id)} className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:opacity-90">
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* LEADERBOARD + ACTIVITY */}
          <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
            <div className="surface-card p-6">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 mb-5">
                <div className="flex items-center gap-2 min-w-0">
                  <Trophy className="h-5 w-5 text-accent-gold shrink-0" />
                  <h3 className="font-display text-lg font-bold truncate">Campus Leaderboard</h3>
                </div>
                <Link to="/leaderboard" className="text-sm text-primary font-semibold">View All</Link>
              </div>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-secondary text-muted-foreground text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">Rank</th>
                      <th className="text-left px-4 py-3 font-semibold">Name</th>
                      <th className="text-right px-4 py-3 font-semibold">Points</th>
                      <th className="text-right px-4 py-3 font-semibold">Badges</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((u) => (
                      <tr key={u.rank} className="border-t border-border hover:bg-primary-soft/40 transition">
                        <td className="px-4 py-3">
                          <span className={`inline-grid place-items-center h-7 w-7 rounded-full text-xs font-bold ${
                            u.rank === 1 ? "bg-accent-gold text-primary" :
                            u.rank === 2 ? "bg-secondary text-foreground" :
                            u.rank === 3 ? "bg-accent-gold-soft text-accent-gold" :
                            "bg-secondary text-muted-foreground"
                          }`}>
                            {u.rank}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent-gold shrink-0" />
                            <span className="font-semibold truncate">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">{u.points.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-gold">
                            <Award className="h-3.5 w-3.5" /> {u.badges}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="surface-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-bold">Live Activity</h3>
                <span className="ml-auto h-2 w-2 rounded-full bg-success animate-pulse" />
              </div>
              <ul className="space-y-3">
                {activity.map((a, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent-gold shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{a.who}</span>{" "}
                        <span className="text-muted-foreground">{a.action}</span>{" "}
                        <span className="font-semibold text-primary">{a.target}</span>
                      </p>
                      <span className="text-xs text-muted-foreground">{a.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* PERSONALIZED ROW */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecommendationsCard />
            <CampusJourneyCard />
            <AchievementsCard />
          </section>

          {/* ANNOUNCEMENTS */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnnouncementsCard />
            <div className="surface-card p-6">
              <h3 className="font-display text-lg font-bold mb-3">Brand Partners</h3>
              <p className="text-sm text-muted-foreground mb-5">Verified brands posting opportunities for our campus.</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {[
                  { name: "Unstop", img: "/images/brands/unstop.png" },
                  { name: "Zomato", img: "/images/brands/zomato.png" },
                  { name: "JioStar", img: "/images/brands/jiostar.png" },
                  { name: "Razorpay", img: "/images/brands/razorpay.png" },
                  { name: "TEDx", img: "/images/brands/tedx-nitj.png" },
                ].map((b) => (
                  <div key={b.name} className="aspect-square rounded-xl overflow-hidden border border-border">
                    <img src={b.img} alt={b.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FOOTER CTA */}
          <section className="rounded-2xl bg-primary text-primary-foreground p-8 lg:p-10 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-display text-3xl font-extrabold">
                Don't Miss <span className="text-accent-gold">Out!</span>
              </h3>
              <p className="mt-2 text-primary-foreground/80 max-w-xl">
                Join our WhatsApp community for early access to opportunities, events and exclusive campus drops.
              </p>
              <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-white text-primary px-5 py-2.5 text-sm font-bold hover:bg-accent-gold transition">
                <span className="h-5 w-5 rounded-full bg-success grid place-items-center text-white text-xs">✓</span>
                Scan to Join
              </button>
            </div>
            <div className="h-32 w-32 rounded-2xl bg-white grid place-items-center text-primary justify-self-start md:justify-self-end relative z-10">
              <QrCode className="h-24 w-24" />
            </div>
            {/* Decorative diamonds */}
            <div className="absolute right-40 top-6 h-3 w-3 rotate-45 border border-white/30" />
            <div className="absolute right-60 bottom-10 h-4 w-4 rotate-45 border border-accent-gold/50" />
            <div className="absolute right-10 -bottom-4 h-20 w-20 rounded-full bg-white/5" />
          </section>

          {/* Quote */}
          <section className="text-center py-6">
            <p className="text-muted-foreground italic max-w-2xl mx-auto">
              <span className="text-accent-gold text-2xl font-bold">"</span>
              The beautiful thing about learning is that no one can take it away from you.
              <span className="text-accent-gold text-2xl font-bold">"</span>
            </p>
            <p className="mt-2 text-sm font-semibold">— Dr. B. R. Ambedkar</p>
          </section>
        </main>
      </div>
    </div>
  );
}
