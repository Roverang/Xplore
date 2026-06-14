import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Search as SearchIcon, MapPin, Calendar, Briefcase, Users, X } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { clubs, events, opportunities } from "@/lib/data";

const schema = z.object({
  q: fallback(z.string(), "").default(""),
  type: fallback(z.enum(["all", "clubs", "events", "opportunities"]), "all").default("all"),
  category: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/search")({
  validateSearch: zodValidator(schema),
  head: () => ({ meta: [{ title: "Search — Xplore" }, { name: "description", content: "Search clubs, events and opportunities on Xplore." }] }),
  component: SearchPage,
});

const eventTags = Array.from(new Set(events.map((e) => e.tag)));
const clubCats = Array.from(new Set(clubs.map((c) => c.category)));
const oppTypes = Array.from(new Set(opportunities.map((o) => o.type)));

function SearchPage() {
  const { q, type, category } = Route.useSearch();
  const navigate = Route.useNavigate();

  const setSearch = (next: Partial<{ q: string; type: typeof type; category: string }>) =>
    navigate({ search: (prev: { q: string; type: typeof type; category: string }) => ({ ...prev, ...next }) });

  const term = q.toLowerCase().trim();
  const match = (s: string) => !term || s.toLowerCase().includes(term);

  const clubResults = clubs.filter((c) => (match(c.name) || match(c.category) || match(c.tagline)) && (!category || c.category === category));
  const eventResults = events.filter((e) => (match(e.name) || match(e.venue) || match(e.tag)) && (!category || e.tag === category));
  const oppResults = opportunities.filter((o) => (match(o.title) || match(o.org) || match(o.type)) && (!category || o.type === category));

  const showClubs = type === "all" || type === "clubs";
  const showEvents = type === "all" || type === "events";
  const showOpps = type === "all" || type === "opportunities";

  const total =
    (showClubs ? clubResults.length : 0) +
    (showEvents ? eventResults.length : 0) +
    (showOpps ? oppResults.length : 0);

  const facets = type === "clubs" ? clubCats : type === "events" ? eventTags : type === "opportunities" ? oppTypes : [];

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <TopBar />
        <main className="px-6 lg:px-10 py-6 max-w-[1600px] mx-auto">
          <div className="surface-card p-5 mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setSearch({ q: e.target.value })}
                placeholder="Search clubs, events, opportunities..."
                className="w-full h-12 pl-11 pr-10 rounded-full bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
              {q && (
                <button onClick={() => setSearch({ q: "" })} className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 grid place-items-center rounded-full hover:bg-primary-soft">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["all", "clubs", "events", "opportunities"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSearch({ type: t, category: "" })}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
                    type === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-primary-soft"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {facets.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <span className="text-xs text-muted-foreground">Filter:</span>
                <button
                  onClick={() => setSearch({ category: "" })}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${!category ? "bg-accent-gold text-primary" : "bg-secondary text-muted-foreground hover:bg-primary-soft"}`}
                >
                  Any
                </button>
                {facets.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSearch({ category: f })}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${category === f ? "bg-accent-gold text-primary" : "bg-secondary text-muted-foreground hover:bg-primary-soft"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            {total} result{total === 1 ? "" : "s"}{term ? ` for "${q}"` : ""}
          </p>

          {/* Clubs */}
          {showClubs && clubResults.length > 0 && (
            <Section title="Clubs" icon={<Users className="h-4 w-4" />} count={clubResults.length}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clubResults.map((c) => (
                  <Link key={c.id} to="/clubs/$clubId" params={{ clubId: c.id }} className="surface-card p-5 hover:shadow-elevated hover:-translate-y-0.5 transition flex gap-4">
                    <img src={c.image} alt={c.name} className="h-14 w-14 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.category} · {c.members} members</div>
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{c.tagline}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {/* Events */}
          {showEvents && eventResults.length > 0 && (
            <Section title="Events" icon={<Calendar className="h-4 w-4" />} count={eventResults.length}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {eventResults.map((e) => (
                  <Link key={e.id} to="/events/$eventId" params={{ eventId: e.id }} className="surface-card p-4 grid grid-cols-[64px_minmax(0,1fr)_auto] gap-4 items-center hover:border-primary/30 hover:shadow-soft transition">
                    <img src={e.image} alt={e.name} className="h-16 w-16 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{e.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5"><MapPin className="h-3 w-3" /> {e.venue}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5"><Calendar className="h-3 w-3" /> {e.date} · {e.time}</div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-primary-soft text-primary uppercase tracking-wider">{e.tag}</span>
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {/* Opportunities */}
          {showOpps && oppResults.length > 0 && (
            <Section title="Opportunities" icon={<Briefcase className="h-4 w-4" />} count={oppResults.length}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {oppResults.map((o) => (
                  <div key={o.id} className="surface-card p-5">
                    <div className="flex items-start gap-3">
                      <img src={o.image} alt={o.org} className="h-12 w-12 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm truncate">{o.title}</div>
                        <div className="text-xs text-muted-foreground">{o.org} · {o.location}</div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-accent-gold-soft text-accent-gold uppercase tracking-wider shrink-0">{o.type}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-border">
                      <div className="text-sm font-bold">{o.stipend}</div>
                      <button className="rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-xs font-semibold hover:opacity-90">Apply</button>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {total === 0 && (
            <div className="surface-card p-12 text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-primary-soft grid place-items-center text-primary mb-4">
                <SearchIcon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold">No results</h3>
              <p className="text-sm text-muted-foreground mt-1">Try a different keyword or clear your filters.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Section({ title, icon, count, children }: { title: string; icon: React.ReactNode; count: number; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="h-7 w-7 rounded-full bg-primary-soft text-primary grid place-items-center">{icon}</span>
        <h2 className="font-display text-lg font-bold">{title}</h2>
        <span className="text-xs text-muted-foreground">({count})</span>
      </div>
      {children}
    </section>
  );
}
