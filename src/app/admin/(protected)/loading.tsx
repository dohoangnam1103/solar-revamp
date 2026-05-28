/**
 * Default loading skeleton for admin pages.
 * Simple skeleton showing typical admin page structure: header + table/card grid.
 */
export default function AdminLoading() {
  return (
    <div className="animate-pulse p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6 space-y-2">
        <div className="h-7 w-64 rounded-md bg-gray-200" />
        <div className="h-4 w-96 rounded-full bg-gray-100" />
      </div>

      {/* Action bar */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="h-9 w-72 rounded-lg bg-gray-200" />
        <div className="h-9 w-32 rounded-lg bg-green-200" />
      </div>

      {/* Card grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {['a', 'b', 'c', 'd', 'e', 'f'].map((key) => (
          <div
            key={key}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 h-5 w-3/4 rounded-md bg-gray-200" />
            <div className="mb-2 h-3 w-full rounded-full bg-gray-100" />
            <div className="mb-2 h-3 w-5/6 rounded-full bg-gray-100" />
            <div className="mt-4 flex gap-2">
              <div className="h-7 w-16 rounded-md bg-gray-100" />
              <div className="h-7 w-16 rounded-md bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
