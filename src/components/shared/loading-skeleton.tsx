import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ProjectCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3.5 w-40" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-1.5 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <div className="border-b border-border bg-muted/40 px-4 py-3 flex gap-8">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-16" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-border last:border-0 px-4 py-3.5 flex gap-8 items-center">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className={`h-4 ${j === 1 ? "w-48" : "w-20"}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function OverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card className="shadow-sm">
          <CardContent className="p-5 grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`space-y-1.5 ${i >= 4 ? "col-span-2" : ""}`}>
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-5 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div>
        <Card className="shadow-sm">
          <CardContent className="p-5 space-y-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3.5 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
