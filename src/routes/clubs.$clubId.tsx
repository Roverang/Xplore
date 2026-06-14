import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, MapPin, Users, Award, Share2, MessageCircle, ImagePlus } from "lucide-react";
import { Sidebar, MediaSlot } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { getClub, getClubEvents, clubMembers, clubPosts } from "@/lib/data";
import { joinClub, uploadMedia } from "@/lib/api/platform.functions";
import { useSession } from "@/lib/use-session";
import { useState } from "react";

export const Route = createFileRoute("/clubs/$clubId")({
  loader: ({ params }) => {
    const club = getClub(params.clubId);
    if (!club) throw notFound();
    return { club };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.club.name ?? "Club"} — Xplore` },
      { name: "description", content: loaderData?.club.tagline ?? "Club profile on Xplore." },
    ],
  }),
  component: ClubProfile,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center text-center p-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Club not found</h1>
        <Link to="/" className="mt-4 inline-block text-primary font-semibold">← Back to home</Link>
      </div>
    </div>
  ),
});

function ClubProfile() {
  const { club } = Route.useLoaderData();
  const events = getClubEvents(club.id);
  const members = clubMembers.default;
  const session = useSession();
  const [joinState, setJoinState] = useState("");
  const [media, setMedia] = useState<Array<{ id: string; name: string; dataUrl: string }>>([]);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <TopBar />
        <main className="px-6 lg:px-10 py-6 space-y-8 max-w-[1600px] mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          {/* Banner + logo header */}
          <section className="surface-card overflow-hidden">
            <div className="relative w-full" style={{aspectRatio:'4/1'}}><img src={club.image} alt={club.name} className="w-full h-full object-cover" /></div>
            <div className="p-6 lg:p-8 grid grid-cols-1 md:grid-cols-[120px_minmax(0,1fr)_auto] gap-6 items-start -mt-16 md:-mt-20 relative">
              <img src={club.image ?? '/images/clubs/geeek-workshop.png'} alt={club.name} className="h-28 w-28 md:h-32 md:w-32 rounded-2xl object-cover ring-4 ring-card" />
              <div className="min-w-0">
                <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-primary-soft text-primary">{club.category}</span>
                <h1 className="mt-2 font-display text-3xl lg:text-4xl font-extrabold">{club.name}</h1>
                <p className="mt-1 text-muted-foreground">{club.tagline}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> {club.members} members</span>
                  <span className="inline-flex items-center gap-1.5"><Award className="h-4 w-4" /> Founded {club.founded}</span>
                  <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> Led by {club.president}</span>
                </div>
              </div>
              <div className="flex gap-2 md:self-center">
                <button
                  onClick={async () => {
                    if (!session) {
                      setJoinState("Please sign in before joining a club.");
                      return;
                    }
                    try {
                      await joinClub({ data: { token: session.token, clubId: club.id } });
                      setJoinState("Membership saved to your dashboard.");
                    } catch (err) {
                      setJoinState(err instanceof Error ? err.message : "Could not join club.");
                    }
                  }}
                  className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90"
                >
                  Join Club
                </button>
                <button className="rounded-full bg-secondary px-3 py-2.5 hover:bg-primary-soft" aria-label="Share">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {joinState && <p className="px-6 lg:px-8 pb-6 text-sm text-primary font-semibold">{joinState}</p>}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <div className="space-y-6 min-w-0">
              {/* About */}
              <section className="surface-card p-6">
                <h2 className="font-display text-lg font-bold mb-3">About</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{club.about}</p>
              </section>

              {/* Posts */}
              <section className="surface-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-bold">Posts</h2>
                  <button className="text-sm text-primary font-semibold">View all</button>
                </div>
                <ul className="space-y-4">
                  {clubPosts.map((p) => (
                    <li key={p.id} className="flex gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent-gold shrink-0" />
                      <div className="min-w-0 flex-1 rounded-xl border border-border p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-sm">{p.author}</span>
                          <span className="text-xs text-muted-foreground">{p.time}</span>
                        </div>
                        <p className="mt-1.5 text-sm text-foreground/90">{p.body}</p>
                        <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                          <button className="inline-flex items-center gap-1 hover:text-primary"><MessageCircle className="h-3.5 w-3.5" /> Comment</button>
                          <button className="inline-flex items-center gap-1 hover:text-primary"><Share2 className="h-3.5 w-3.5" /> Share</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Upcoming events */}
              <section className="surface-card p-6">
                <h2 className="font-display text-lg font-bold mb-4">Upcoming Events</h2>
                {events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming events yet — check back soon.</p>
                ) : (
                  <div className="space-y-3">
                    {events.map((e) => (
                      <Link
                        key={e.id}
                        to="/events/$eventId"
                        params={{ eventId: e.id }}
                        className="grid grid-cols-[56px_minmax(0,1fr)_auto] gap-4 items-center p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary-soft/40 transition"
                      >
                        <div className="h-14 w-14 rounded-lg media-frame" />
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{e.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5"><MapPin className="h-3 w-3" /> {e.venue}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5"><Calendar className="h-3 w-3" /> {e.date} · {e.time}</div>
                        </div>
                        <span className="text-xs font-semibold text-primary">View →</span>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              {/* Media gallery */}
              <section className="surface-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-bold">Media Gallery</h2>
                  <label className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold cursor-pointer">
                    <ImagePlus className="h-4 w-4" /> Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file || !session) {
                          setJoinState("Sign in before uploading media.");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = async () => {
                          const result = await uploadMedia({
                            data: {
                              token: session.token,
                              ownerType: "club",
                              ownerId: club.id,
                              name: file.name,
                              dataUrl: String(reader.result),
                            },
                          });
                          setMedia((items) => [result, ...items]);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[...media, ...Array.from({ length: 8 }).map((_, i) => ({ id: `placeholder-${i}`, name: i === 0 ? "Club logo" : `Banner ${i}`, dataUrl: "" }))].slice(0, 8).map((item) => (
                    <MediaSlot key={item.id} label={item.name} ratio="1/1">
                      {item.dataUrl ? <img src={item.dataUrl} alt={item.name} className="absolute inset-0 h-full w-full object-cover" /> : undefined}
                    </MediaSlot>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar: members */}
            <aside className="space-y-6">
              <section className="surface-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-bold">Core Members</h2>
                  <span className="text-xs text-muted-foreground">{members.length}</span>
                </div>
                <ul className="space-y-3">
                  {members.map((m) => (
                    <li key={m.name} className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent-gold shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm truncate">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.role}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
