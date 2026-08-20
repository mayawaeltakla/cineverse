export function PosterSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`w-40 sm:w-44 md:w-48 shrink-0 ${className}`}>
      <div className="aspect-[2/3] animate-pulse rounded-lg border border-cream/5 bg-night-800" />
      <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-night-700" />
      <div className="mt-1.5 h-2.5 w-1/2 animate-pulse rounded bg-night-800" />
    </div>
  );
}

export function RowSkeleton({ count = 7 }: { count?: number }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="h-7 w-1.5 animate-pulse rounded-full bg-night-700" />
        <div className="h-7 w-44 animate-pulse rounded bg-night-700" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: count }, (_, i) => (
          <PosterSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="mx-auto flex h-[74vh] max-w-7xl items-center gap-10 px-5">
      <div className="flex-1 space-y-4">
        <div className="h-4 w-32 animate-pulse rounded bg-night-700" />
        <div className="h-14 w-3/4 animate-pulse rounded bg-night-700" />
        <div className="h-4 w-full animate-pulse rounded bg-night-800" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-night-800" />
        <div className="flex gap-3 pt-2">
          <div className="h-11 w-36 animate-pulse rounded-full bg-night-700" />
          <div className="h-11 w-32 animate-pulse rounded-full bg-night-800" />
        </div>
      </div>
      <div className="hidden md:block h-[52vh] w-[34vh] shrink-0 animate-pulse rounded-xl bg-night-800" />
    </div>
  );
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="w-full">
          <div className="aspect-[2/3] animate-pulse rounded-lg border border-cream/5 bg-night-800" />
          <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-night-700" />
        </div>
      ))}
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-28">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="mx-auto h-[46vh] w-[30vh] shrink-0 animate-pulse rounded-xl bg-night-800" />
        <div className="flex-1 space-y-4">
          <div className="h-10 w-2/3 animate-pulse rounded bg-night-700" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-night-800" />
          <div className="h-24 w-full animate-pulse rounded bg-night-800" />
          <div className="flex gap-3">
            <div className="h-11 w-32 animate-pulse rounded-full bg-night-700" />
            <div className="h-11 w-32 animate-pulse rounded-full bg-night-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
