'use client'

import { compassLabel } from '@/lib/check/solar'

type Props = {
  headingDeg: number | null
  supported: boolean
  absolute: boolean
  scorePct: number | null
  computing: boolean
}

export function CompassCard({
  headingDeg,
  supported,
  absolute,
  scorePct,
  computing,
}: Props) {
  const hasHeading = headingDeg != null
  const normalized = hasHeading ? ((headingDeg % 360) + 360) % 360 : 0
  const direction = hasHeading ? compassLabel(normalized) : null

  const scoreTone =
    scorePct == null
      ? 'text-slate-400'
      : scorePct >= 95
        ? 'text-emerald-500'
        : scorePct >= 80
          ? 'text-lime-500'
          : scorePct >= 60
            ? 'text-amber-500'
            : 'text-rose-500'

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          La bàn
        </h2>
        <div className="check-tabular text-sm text-slate-500">
          {hasHeading ? (
            <>
              <span className="font-semibold text-slate-700">
                {normalized.toFixed(0)}°
              </span>{' '}
              {direction}
            </>
          ) : (
            'Chưa có dữ liệu'
          )}
        </div>
      </div>

      <div
        className="@container relative mx-auto mt-4 aspect-square w-full rounded-full border border-slate-300 bg-slate-50 shadow-inner"
        aria-label={
          hasHeading
            ? `La bàn đang chỉ ${direction}`
            : 'La bàn chưa có dữ liệu'
        }
        role="img"
      >
        <Direction heading={normalized} angle={0} label="Bắc" />
        <Direction heading={normalized} angle={90} label="Đông" />
        <Direction heading={normalized} angle={180} label="Nam" />
        <Direction heading={normalized} angle={270} label="Tây" />

        <div className="absolute inset-[14%] rounded-full border border-slate-200" />

        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full bg-rose-600"
          style={{ top: '4%', width: '1.5%', height: '8%' }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className={`check-tabular font-bold leading-none ${scoreTone}`}
            style={{ fontSize: '28cqw' }}
          >
            {scorePct != null ? scorePct : '—'}
          </div>
          <div
            className="mt-1 font-medium text-slate-400"
            style={{ fontSize: '7cqw' }}
          >
            / 100
          </div>
          {computing && (
            <div
              className="mt-1 uppercase tracking-wide text-slate-400"
              style={{ fontSize: '3.5cqw' }}
            >
              đang tính…
            </div>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {!supported
          ? 'Trình duyệt chưa báo hỗ trợ la bàn.'
          : hasHeading
            ? absolute
              ? 'Đang dùng hướng la bàn tuyệt đối.'
              : 'Hướng có thể chưa tuyệt đối, hãy hiệu chuẩn bằng cách lắc máy hình số 8.'
            : 'Bấm cấp quyền cảm biến để nhận hướng la bàn từ điện thoại.'}
      </p>
    </section>
  )
}

function Direction({
  heading,
  angle,
  label,
}: {
  heading: number
  angle: number
  label: string
}) {
  const rotation = angle - heading

  return (
    <span
      className="absolute left-1/2 top-1/2 origin-center text-center font-semibold uppercase text-slate-500 transition-transform duration-150 ease-out"
      style={{
        fontSize: '4cqw',
        width: '16cqw',
        transform: `translate(-50%, -50%) rotate(${rotation}deg) translateY(-42cqw)`,
      }}
    >
      {label}
    </span>
  )
}
