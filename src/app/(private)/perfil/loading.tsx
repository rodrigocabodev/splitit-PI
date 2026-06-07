export default function Loading() {
  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6 animate-pulse">
      <div className="h-8 w-32 bg-gray-200 rounded" />
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-8 w-24 bg-gray-100 rounded-md" />
        ))}
      </div>
      <div className="border rounded-xl p-5 h-24 bg-gray-50" />
      <div className="border rounded-xl p-4 h-32 bg-gray-50" />
    </div>
  );
}
