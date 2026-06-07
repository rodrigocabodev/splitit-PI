export default function Loading() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl animate-pulse">
      <div>
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-3 w-32 bg-muted/60 rounded mt-2" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-xl p-4 h-24 bg-card flex flex-col gap-2">
            <div className="h-3 w-12 bg-muted rounded" />
            <div className="h-6 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-4 w-32 bg-muted rounded mb-2" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-xl h-16 bg-card" />
        ))}
      </div>
    </div>
  );
}
