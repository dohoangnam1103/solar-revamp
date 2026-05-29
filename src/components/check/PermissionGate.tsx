'use client'

type Props = {
  geoSupported: boolean
  geoError: string | null
  geoReady: boolean
  oriSupported: boolean
  oriError: string | null
  oriReady: boolean
  onRequest: () => void
}

export function PermissionGate({
  geoSupported,
  geoError,
  geoReady,
  oriSupported,
  oriError,
  oriReady,
  onRequest,
}: Props) {
  const allReady = geoReady && oriReady
  if (allReady) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-amber-300/50 bg-amber-50 p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-amber-900">
          Cần cấp quyền cảm biến
        </h2>
        <p className="mt-2 text-sm text-amber-900/80">
          App cần truy cập <b>vị trí (GPS)</b> để biết quỹ đạo mặt trời tại nơi
          bạn đứng và <b>cảm biến chuyển động</b> để đọc hướng + góc nghiêng của
          điện thoại. Toàn bộ tính toán chạy trên thiết bị, không gửi đi đâu.
        </p>

        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <Status ok={geoReady} />
            <div>
              <div>
                <b>GPS</b>{' '}
                {!geoSupported && (
                  <span className="text-rose-600">không hỗ trợ</span>
                )}
                {geoSupported && !geoReady && (
                  <span className="text-slate-500">chưa lấy được toạ độ</span>
                )}
                {geoReady && <span className="text-emerald-600">sẵn sàng</span>}
              </div>
              {geoError && (
                <div className="text-xs text-rose-600">{geoError}</div>
              )}
            </div>
          </li>
          <li className="flex items-start gap-2">
            <Status ok={oriReady} />
            <div>
              <div>
                <b>Hướng la bàn / nghiêng</b>{' '}
                {!oriSupported && (
                  <span className="text-rose-600">không hỗ trợ</span>
                )}
                {oriSupported && !oriReady && (
                  <span className="text-slate-500">cần cấp quyền</span>
                )}
                {oriReady && <span className="text-emerald-600">sẵn sàng</span>}
              </div>
              {oriError && (
                <div className="text-xs text-rose-600">{oriError}</div>
              )}
            </div>
          </li>
        </ul>

        <button
          type="button"
          onClick={onRequest}
          className="mt-5 w-full rounded-xl bg-amber-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-amber-700 active:scale-[0.98]"
        >
          Cấp quyền &amp; bắt đầu
        </button>

        <p className="mt-3 text-xs text-amber-900/70">
          Lưu ý: trên iOS Safari, các cảm biến chỉ hoạt động khi trang được mở
          qua HTTPS (hoặc localhost). Nếu mở qua HTTP từ máy khác sẽ bị chặn.
        </p>
      </div>
    </div>
  )
}

function Status({ ok }: { ok: boolean }) {
  return (
    <span
      aria-hidden
      className={
        'mt-1 inline-block size-3 shrink-0 rounded-full ' +
        (ok ? 'bg-emerald-500' : 'bg-slate-300')
      }
    />
  )
}
