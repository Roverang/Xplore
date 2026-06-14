import { Award, Compass, Crown, Megaphone, Network, Star } from "lucide-react";

const badges = [
  { label: "Event Explorer", Icon: Compass, earned: true },
  { label: "Club Champion", Icon: Crown, earned: true },
  { label: "Campus Ambassador", Icon: Megaphone, earned: true },
  { label: "Network Builder", Icon: Network, earned: false },
  { label: "Top Contributor", Icon: Star, earned: false },
];

export function AchievementsCard() {
  return (
    <div className="surface-card p-6 h-full">
      <div className="flex items-center gap-2 mb-5">
        <Award className="h-5 w-5 text-accent-gold" />
        <h3 className="font-display text-lg font-bold">Achievements</h3>
        <span className="ml-auto text-xs text-muted-foreground font-semibold">
          {badges.filter((b) => b.earned).length}/{badges.length}
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {badges.map(({ label, Icon, earned }) => (
          <div key={label} className="flex flex-col items-center text-center">
            <div
              className={`h-14 w-14 rounded-full grid place-items-center mb-2 ${
                earned
                  ? "bg-gradient-to-br from-primary to-accent-gold text-primary-foreground shadow-elevated"
                  : "bg-secondary text-muted-foreground border border-border opacity-60"
              }`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <span className={`text-[11px] font-semibold leading-tight ${earned ? "" : "text-muted-foreground"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
