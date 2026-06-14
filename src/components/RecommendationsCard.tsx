import { Sparkles, ArrowRight, Users, Calendar, Briefcase } from "lucide-react";

const recs = [
  { icon: Users, title: "Join Robotics Club", reason: "Matches your interest in hardware", cta: "Join" },
  { icon: Calendar, title: "Attend AI Bootcamp", reason: "Recommended for CSE 3rd year", cta: "Register" },
  { icon: Briefcase, title: "Apply for Campus Ambassador", reason: "Top match for your profile", cta: "Apply" },
];

export function RecommendationsCard() {
  return (
    <div className="surface-card p-6 h-full">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="h-5 w-5 text-accent-gold" />
        <h3 className="font-display text-lg font-bold">Recommended For You</h3>
      </div>
      <ul className="space-y-3">
        {recs.map(({ icon: Icon, title, reason, cta }) => (
          <li key={title} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary-soft/40 transition">
            <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm truncate">{title}</div>
              <div className="text-xs text-muted-foreground truncate">{reason}</div>
            </div>
            <button className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-primary text-primary-foreground px-3 py-1.5 hover:opacity-90">
              {cta} <ArrowRight className="h-3 w-3" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
