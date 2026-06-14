// Reusable skeleton / shimmer loading components for Xplore

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-secondary before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="surface-card p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-4">
        <Shimmer className="h-14 w-14 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-2/3" />
          <Shimmer className="h-3 w-1/2" />
        </div>
      </div>
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-4/5" />
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="surface-card p-4 flex items-center gap-4 animate-pulse">
          <Shimmer className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-3.5 w-1/2" />
            <Shimmer className="h-3 w-1/3" />
          </div>
          <Shimmer className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="surface-card p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <Shimmer className="h-16 w-16 rounded-full shrink-0" />
        <div className="flex-1 space-y-3">
          <Shimmer className="h-5 w-1/3" />
          <Shimmer className="h-3.5 w-1/2" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Shimmer className="h-8 w-full" />
            <Shimmer className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="surface-card p-5 animate-pulse space-y-3">
          <Shimmer className="h-9 w-9 rounded-xl" />
          <Shimmer className="h-7 w-1/2" />
          <Shimmer className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}
