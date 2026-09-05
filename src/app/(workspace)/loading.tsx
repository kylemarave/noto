import { Skeleton } from "@/components/ui/skeleton";

function SectionSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-3.5 w-24" />
      <div className="flex flex-col">
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0"
          >
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WorkspaceLoading() {
  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-3.5 w-64" />
      </div>
      <div className="flex flex-wrap gap-x-10 gap-y-4 border-b border-border pb-6">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="flex flex-col gap-1.5">
            <Skeleton className="h-7 w-10" />
            <Skeleton className="h-3.5 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="flex min-w-0 flex-col gap-8">
          <SectionSkeleton />
          <SectionSkeleton />
        </div>
        <div className="flex min-w-0 flex-col gap-8">
          <SectionSkeleton />
          <SectionSkeleton />
        </div>
      </div>
    </div>
  );
}
