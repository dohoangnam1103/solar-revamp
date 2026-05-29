/**
 * Skeleton tailored for the site-config form page (instead of the grid skeleton
 * inherited from /admin/(protected)/loading.tsx which doesn't match a form layout).
 */
export default function SiteConfigLoading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse space-y-6 p-6">
      <div className="space-y-2">
        <div className="h-7 w-64 rounded-md bg-gray-200" />
        <div className="h-4 w-80 rounded-full bg-gray-100" />
      </div>

      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        {['a', 'b', 'c', 'd', 'e'].map((key) => (
          <div key={key} className="space-y-2">
            <div className="h-3 w-32 rounded-full bg-gray-100" />
            <div className="h-10 w-full rounded-lg bg-gray-100" />
          </div>
        ))}

        <div className="flex justify-end pt-2">
          <div className="h-10 w-28 rounded-lg bg-green-200" />
        </div>
      </div>
    </div>
  )
}
