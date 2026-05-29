/**
 * Skeleton tailored for the ve-soliq-config form page (instead of the grid skeleton
 * inherited from /admin/(protected)/loading.tsx which doesn't match a form layout).
 */
export default function VeSoliqConfigLoading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse space-y-6 p-6">
      <div className="space-y-2">
        <div className="h-7 w-72 rounded-md bg-gray-200" />
        <div className="h-4 w-96 rounded-full bg-gray-100" />
      </div>

      {/* Form sections */}
      {['a', 'b', 'c'].map((section) => (
        <div key={section} className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="h-5 w-40 rounded-md bg-gray-200" />
          {['x', 'y', 'z'].map((row) => (
            <div key={row} className="space-y-2">
              <div className="h-3 w-32 rounded-full bg-gray-100" />
              <div className="h-10 w-full rounded-lg bg-gray-100" />
            </div>
          ))}
        </div>
      ))}

      {/* Gallery grid skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-48 rounded-md bg-gray-200" />
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          {['a', 'b', 'c'].map((key) => (
            <div key={key} className="flex items-center gap-4 border-b border-gray-100 py-3 last:border-0">
              <div className="h-20 w-32 rounded-lg bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-40 rounded-full bg-gray-100" />
                <div className="h-3 w-24 rounded-full bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
