export default function Loading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 rounded" />
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-24 bg-gray-100 rounded-md" />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border rounded-xl h-20 bg-gray-50" />
        ))}
      </div>
    </div>
  );
}
