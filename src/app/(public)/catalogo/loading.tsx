export default function Loading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-8 w-56 bg-muted rounded" />
      <div className="h-10 w-full max-w-sm bg-muted/60 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-xl overflow-hidden">
            <div className="h-40 bg-muted" />
            <div className="p-4 flex flex-col gap-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted/60 rounded w-full" />
              <div className="h-3 bg-muted/60 rounded w-5/6" />
              <div className="h-4 bg-muted rounded w-1/3 mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
