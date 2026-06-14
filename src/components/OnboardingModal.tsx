import { useState, useEffect } from "react";
import { X, Users, Calendar, Briefcase, Sparkles, ChevronRight, Check, PartyPopper } from "lucide-react";
import { joinClub } from "@/lib/api/platform.functions";
import { clubs } from "@/lib/data";

const INTEREST_OPTIONS = [
  { emoji: "💻", label: "Technology" },
  { emoji: "🎵", label: "Music" },
  { emoji: "🤖", label: "Robotics" },
  { emoji: "📖", label: "Literary" },
  { emoji: "🚀", label: "Entrepreneurship" },
  { emoji: "⚡", label: "Coding" },
  { emoji: "🎨", label: "Design" },
  { emoji: "🏆", label: "Sports" },
  { emoji: "🔬", label: "Science" },
  { emoji: "🌍", label: "Social Causes" },
];

const features = [
  { icon: Users, title: "Join Clubs", desc: "Discover and join 48+ campus clubs." },
  { icon: Calendar, title: "Attend Events", desc: "Register for events, workshops & fests." },
  { icon: Briefcase, title: "Grab Opportunities", desc: "Apply to internships and brand roles." },
];

interface OnboardingModalProps {
  token: string;
  onComplete: () => void;
}

type Step = "welcome" | "interests" | "clubs" | "done";

export function OnboardingModal({ token, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<Step>("welcome");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [joining, setJoining] = useState(false);
  const [confetti, setConfetti] = useState(false);

  // Filtered clubs by selected interests
  const suggestedClubs = clubs.filter((c) =>
    selectedInterests.some((i) => c.category.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(c.category.toLowerCase()))
  ).slice(0, 6);

  const displayClubs = suggestedClubs.length > 0 ? suggestedClubs : clubs.slice(0, 6);

  function toggleInterest(label: string) {
    setSelectedInterests((prev) => prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]);
  }

  function toggleClub(id: string) {
    setSelectedClubs((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  }

  async function finishOnboarding() {
    setJoining(true);
    try {
      for (const clubId of selectedClubs) {
        await joinClub({ data: { token, clubId } }).catch(() => {});
      }
    } finally {
      setJoining(false);
      setStep("done");
      setConfetti(true);
      // Mark onboarding complete
      localStorage.removeItem("xplore_onboarding_pending");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/70 backdrop-blur-sm" />
      <div className="relative bg-card border border-border rounded-2xl shadow-elevated w-full max-w-lg animate-fade-up overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: step === "welcome" ? "25%" : step === "interests" ? "50%" : step === "clubs" ? "75%" : "100%" }}
          />
        </div>

        {/* STEP 1: Welcome */}
        {step === "welcome" && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent-gold grid place-items-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="font-display text-3xl font-extrabold">Welcome to Xplore!</h1>
              <p className="text-muted-foreground mt-2 text-sm">Your campus OS for clubs, events & opportunities</p>
            </div>

            <div className="space-y-3 mb-8">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-4 p-4 rounded-xl bg-secondary">
                  <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{title}</div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep("interests")}
              className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
            >
              Let's get started <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Interests */}
        {step === "interests" && (
          <div className="p-8">
            <button onClick={() => setStep("welcome")} className="text-xs text-muted-foreground mb-4 hover:text-primary">← Back</button>
            <h2 className="font-display text-2xl font-extrabold mb-1">What are you into?</h2>
            <p className="text-sm text-muted-foreground mb-6">Select your interests to get personalized recommendations</p>

            <div className="grid grid-cols-2 gap-2 mb-8">
              {INTEREST_OPTIONS.map(({ emoji, label }) => (
                <button
                  key={label}
                  onClick={() => toggleInterest(label)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left text-sm font-medium transition ${
                    selectedInterests.includes(label)
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border hover:border-primary/40 hover:bg-primary-soft/30"
                  }`}
                >
                  <span className="text-xl">{emoji}</span>
                  <span>{label}</span>
                  {selectedInterests.includes(label) && <Check className="h-4 w-4 ml-auto" />}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep("clubs")}
              className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold hover:opacity-90 transition"
            >
              {selectedInterests.length > 0 ? `Continue with ${selectedInterests.length} interests` : "Skip"}
            </button>
          </div>
        )}

        {/* STEP 3: Join Clubs */}
        {step === "clubs" && (
          <div className="p-8">
            <button onClick={() => setStep("interests")} className="text-xs text-muted-foreground mb-4 hover:text-primary">← Back</button>
            <h2 className="font-display text-2xl font-extrabold mb-1">Join your first clubs</h2>
            <p className="text-sm text-muted-foreground mb-6">Pick clubs to follow and get notified about their events</p>

            <div className="space-y-2 mb-8">
              {displayClubs.map((club) => (
                <button
                  key={club.id}
                  onClick={() => toggleClub(club.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition ${
                    selectedClubs.includes(club.id)
                      ? "border-primary bg-primary-soft"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {club.image ? (
                    <img src={club.image} alt={club.name} className="h-10 w-10 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded-xl bg-secondary shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{club.name}</div>
                    <div className="text-xs text-muted-foreground">{club.members} members · {club.category}</div>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 grid place-items-center transition ${
                    selectedClubs.includes(club.id) ? "border-primary bg-primary" : "border-muted-foreground"
                  }`}>
                    {selectedClubs.includes(club.id) && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={finishOnboarding}
              disabled={joining}
              className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {joining ? "Joining..." : selectedClubs.length > 0 ? `Join ${selectedClubs.length} club${selectedClubs.length > 1 ? 's' : ''} & Continue` : "Skip & Continue"}
            </button>
          </div>
        )}

        {/* STEP 4: Done */}
        {step === "done" && (
          <div className="p-8 text-center">
            <div className="h-20 w-20 rounded-full bg-success-soft grid place-items-center mx-auto mb-6">
              <PartyPopper className="h-10 w-10 text-success" />
            </div>
            <h2 className="font-display text-3xl font-extrabold mb-2">You're all set! 🎉</h2>
            <p className="text-sm text-muted-foreground mb-2">
              {selectedClubs.length > 0
                ? `Joined ${selectedClubs.length} club${selectedClubs.length > 1 ? 's' : ''}. Check your dashboard for updates.`
                : "Your Xplore profile is ready!"}
            </p>
            <p className="text-xs text-muted-foreground mb-8">Discover events, apply to opportunities, and build your campus journey.</p>
            <button
              onClick={onComplete}
              className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold hover:opacity-90 transition"
            >
              Go to Dashboard 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
