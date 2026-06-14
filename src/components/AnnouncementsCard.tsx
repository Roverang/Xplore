import { Pin, ArrowRight } from "lucide-react";

const items = [
  { title: "Hackathon 2026 registrations open", time: "2h ago", tag: "Aavishkar" },
  { title: "Octaves auditions announced", time: "Yesterday", tag: "Octaves" },
  { title: "Campus Ambassador applications extended", time: "2 days ago", tag: "Unstop" },
];

export function AnnouncementsCard() {
  return (
    <div className="surface-card p-6 h-full">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 mb-5">
        <div className="flex items-center gap-2 min-w-0">
          <Pin className="h-5 w-5 text-primary shrink-0" />
          <h3 className="font-display text-lg font-bold truncate">Announcements</h3>
        </div>
        <a href="#" className="text-sm text-primary font-semibold inline-flex items-center gap-1">
          View All <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
      <ul className="space-y-3">
        {items.map((a) => (
          <li key={a.title} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-primary-soft/40 transition">
            <div className="h-9 w-9 rounded-lg bg-accent-gold-soft text-accent-gold grid place-items-center shrink-0">
              <Pin className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm">{a.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                <span className="text-primary font-semibold">{a.tag}</span> · {a.time}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
