import { Compass } from "lucide-react";

const metrics = [
  { label: "Clubs Joined", value: 3, total: 5 },
  { label: "Events Attended", value: 8, total: 15 },
  { label: "Applications Submitted", value: 4, total: 10 },
  { label: "Badges Earned", value: 6, total: 12 },
];

export function CampusJourneyCard() {
  return (
    <div className="surface-card p-6 h-full">
      <div className="flex items-center gap-2 mb-5">
        <Compass className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-bold">Your Campus Journey</h3>
      </div>
      <div className="space-y-4">
        {metrics.map((m) => {
          const pct = Math.round((m.value / m.total) * 100);
          return (
            <div key={m.label}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-medium">{m.label}</span>
                <span className="text-muted-foreground text-xs">
                  <span className="font-bold text-foreground">{m.value}</span>/{m.total} · {pct}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent-gold transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
