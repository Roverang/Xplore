import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Calendar, MapPin, Users, Ticket, Share2, Copy, Check, Twitter, Linkedin, MessageCircle } from "lucide-react";
import { Sidebar, MediaSlot } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { PaymentModal } from "@/components/PaymentModal";
import { getEvent, getClub } from "@/lib/data";
import { registerForEvent } from "@/lib/api/platform.functions";
import { useSession } from "@/lib/use-session";

export const Route = createFileRoute("/events/$eventId")({
  loader: ({ params }) => {
    const event = getEvent(params.eventId);
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.event.name ?? "Event"} — Xplore` },
      { name: "description", content: loaderData?.event.about ?? "Campus event on Xplore." },
    ],
  }),
  component: EventDetail,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center text-center p-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Event not found</h1>
        <Link to="/" className="mt-4 inline-block text-primary font-semibold">← Back to home</Link>
      </div>
    </div>
  ),
});

function EventDetail() {
  const { event } = Route.useLoaderData();
  const club = getClub(event.clubId);
  const [step, setStep] = useState<"idle" | "form" | "payment" | "done">("idle");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(event.registered);
  const [regData, setRegData] = useState({ fullName: "", email: "", rollNumber: "", year: "1st Year" });
  const [showPayment, setShowPayment] = useState(false);
  const session = useSession();
  const isFree = event.fee === "Free" || !event.fee;

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const pct = Math.min(100, Math.round((registered / event.capacity) * 100));

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <TopBar />
        <main className="px-6 lg:px-10 py-6 space-y-6 max-w-[1600px] mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          {/* Banner */}
          <section className="surface-card overflow-hidden">
            <div className="relative w-full" style={{aspectRatio:'3/1'}}><img src={event.image} alt={event.name} className="w-full h-full object-cover" /></div>
            <div className="p-6 lg:p-8 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-6 items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-accent-gold-soft text-accent-gold uppercase tracking-wider">{event.tag}</span>
                  {club && (
                    <Link to="/clubs/$clubId" params={{ clubId: club.id }} className="text-xs font-semibold text-primary hover:underline">
                      by {club.name}
                    </Link>
                  )}
                </div>
                <h1 className="mt-2 font-display text-3xl lg:text-4xl font-extrabold">{event.name}</h1>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {event.date} · {event.time}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {event.venue}</span>
                  <span className="inline-flex items-center gap-1.5"><Ticket className="h-4 w-4" /> {event.fee}</span>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <div className="space-y-6 min-w-0">
              <section className="surface-card p-6">
                <h2 className="font-display text-lg font-bold mb-3">About this event</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{event.about}</p>
              </section>

              <section className="surface-card p-6">
                <h2 className="font-display text-lg font-bold mb-4">Event gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <MediaSlot key={i} label={`Poster ${i + 1}`} ratio="1/1" />
                  ))}
                </div>
              </section>
            </div>

            {/* Registration + share */}
            <aside className="space-y-6">
              <section className="surface-card p-6">
                <h2 className="font-display text-lg font-bold">Registration</h2>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{registered}</span>
                  <span className="text-muted-foreground">/ {event.capacity} registered</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                </div>

                {step === "idle" && (
                  <button
                    onClick={() => setStep("form")}
                    disabled={registered >= event.capacity}
                    className="mt-5 w-full rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    {registered >= event.capacity ? "Sold Out" : "Register Now"}
                  </button>
                )}

                {step === "form" && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setError("");
                      if (!session) { setError("Please sign in before registering."); return; }
                      const fd = new FormData(e.currentTarget);
                      const rd = {
                        fullName: String(fd.get("fullName") || ""),
                        email: String(fd.get("email") || ""),
                        rollNumber: String(fd.get("rollNumber") || ""),
                        year: String(fd.get("year") || "1st Year"),
                      };
                      setRegData(rd);
                      if (isFree) {
                        try {
                          const result = await registerForEvent({ data: { token: session.token, eventId: event.id, ...rd } });
                          setRegistered(result.event.registered);
                          setStep("done");
                        } catch (err) { setError(err instanceof Error ? err.message : "Registration failed."); }
                      } else {
                        setShowPayment(true);
                      }
                    }}
                    className="mt-5 space-y-3"
                  >
                    <input name="fullName" required defaultValue={session?.user.name ?? ""} placeholder="Full name" className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm" />
                    <input name="email" required type="email" defaultValue={session?.user.email ?? ""} placeholder="Campus email" className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm" />
                    <input name="rollNumber" required placeholder="Roll number" className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm" />
                    <select name="year" className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm">
                      <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                    </select>
                    {error && <p className="rounded-lg bg-destructive/10 text-destructive p-2 text-xs">{error}</p>}
                    <button className="w-full rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90">
                      {isFree ? "Confirm Registration" : `Proceed to Pay ${event.fee}`}
                    </button>
                    <button type="button" onClick={() => setStep("idle")} className="w-full text-xs text-muted-foreground hover:text-primary">Cancel</button>
                  </form>
                )}

                {showPayment && session && (
                  <PaymentModal
                    event={event}
                    token={session.token}
                    registrationData={regData}
                    onClose={() => setShowPayment(false)}
                    onSuccess={() => { setRegistered((v) => v + 1); setStep("done"); }}
                  />
                )}

                {step === "done" && (
                  <div className="mt-5 rounded-xl bg-success-soft text-success p-4 text-sm">
                    <div className="flex items-center gap-2 font-semibold">
                      <Check className="h-4 w-4" /> You're registered!
                    </div>
                    <p className="mt-1 text-xs">Check your dashboard for event details.</p>
                  </div>
                )}
              </section>

              <section className="surface-card p-6">
                <h2 className="font-display text-lg font-bold flex items-center gap-2">
                  <Share2 className="h-4 w-4" /> Share this event
                </h2>
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-secondary p-2">
                  <span className="flex-1 min-w-0 truncate text-xs text-muted-foreground px-2">{shareUrl || "/events/" + event.id}</span>
                  <button onClick={copyLink} className="inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold">
                    {copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <a target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(event.name + " — " + shareUrl)}`} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-success-soft text-success text-xs font-semibold py-2 hover:opacity-90">
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                  <a target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.name)}&url=${encodeURIComponent(shareUrl)}`} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-info-soft text-info text-xs font-semibold py-2 hover:opacity-90">
                    <Twitter className="h-3.5 w-3.5" /> Twitter
                  </a>
                  <a target="_blank" rel="noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold py-2 hover:opacity-90">
                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                  </a>
                </div>
              </section>

              {club && (
                <section className="surface-card p-6">
                  <h2 className="font-display text-lg font-bold mb-3">Hosted by</h2>
                  <Link to="/clubs/$clubId" params={{ clubId: club.id }} className="flex items-center gap-3 group">
                    {club.image ? (
                      <img src={club.image} alt={club.name} className="h-12 w-12 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-primary-soft shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate group-hover:text-primary">{club.name}</div>
                      <div className="text-xs text-muted-foreground">{club.category} · {club.members} members</div>
                    </div>
                  </Link>
                </section>
              )}
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
