// Suspense fallback shown while a page/section is fetching from the BFF.
// Usage: <Suspense key={cacheBustingProp} fallback={<LoadingOverlay />}>...</Suspense>
// The `key` matters for query-param-driven reloads (e.g. search) — without
// it React won't re-suspend since the component instance doesn't change.
const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-lamaSkyLight border-t-lamaSky animate-spin" />
        <span className="text-xs font-medium text-gray-500">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingOverlay;
