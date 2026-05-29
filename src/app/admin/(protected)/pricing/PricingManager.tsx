'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, X, GripVertical } from 'lucide-react'
import { createPricingPackage, updatePricingPackage, deletePricingPackage, reorderPricingPackages } from '@/app/actions/admin-crud'
import type { PricingPackage } from '@/lib/db/schema'
import { formatNumberWithDots, formatVnd } from '@/lib/quote/calculator'
import type { QuoteAssumptions } from '@/lib/quote/calculator'
import AdminQuoteSettingsForm from '../settings/AdminQuoteSettingsForm'

type Tab = 'bao-gia-uoc-tinh' | 'hoa-luoi' | 'gia-dinh' | 'doanh-nghiep' | 'hybrid' | 'vat-tu'

const TABS: { id: Tab; label: string }[] = [
  { id: 'bao-gia-uoc-tinh', label: 'Báo giá ước tính' },
  { id: 'gia-dinh', label: 'Điện gia đình' },
  { id: 'doanh-nghiep', label: 'Điện doanh nghiệp' },
  { id: 'hoa-luoi', label: 'Hòa lưới' },
  { id: 'hybrid', label: 'Hybrid lưu trữ' },
  { id: 'vat-tu', label: 'Vật tư' },
]

const VAT_TU_CATEGORIES: { id: string; label: string }[] = [
  { id: 'tam-pin', label: 'Tấm pin mặt trời' },
  { id: 'bien-tan', label: 'Biến tần (Inverter)' },
  { id: 'pin-luu-tru', label: 'Pin lưu trữ' },
]

function formatPrice(price: number | null) {
  if (!price) return '—'
  return formatVnd(price)
}

function moveItem(items: PricingPackage[], fromId: number, toId: number) {
  const fromIndex = items.findIndex((item) => item.id === fromId)
  const toIndex = items.findIndex((item) => item.id === toId)
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return items
  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white rounded-2xl border border-gray-200 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>
  )
}

function PackageForm({ tab, pkg, onClose }: { tab: Tab; pkg?: PricingPackage; onClose: () => void }) {
  const isEdit = !!pkg
  const action = isEdit ? updatePricingPackage.bind(null, pkg.id) : createPricingPackage
  const isVatTu = tab === 'vat-tu'
  const isHybrid = tab === 'hybrid'

  return (
    <form
      action={async (fd) => {
        if (!isEdit) fd.set('page', tab)
        await action(fd)
        onClose()
      }}
      className="space-y-3"
    >
      {isEdit && <input type="hidden" name="page" value={pkg.page} />}
      {!isEdit && <input type="hidden" name="page" value={tab} />}

      {isVatTu ? (
        <>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Danh mục</label>
            <select
              name="category"
              defaultValue={pkg?.category ?? ''}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Chọn danh mục...</option>
              {VAT_TU_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Tên sản phẩm</label>
            <input name="name" required defaultValue={pkg?.name ?? ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Thông số kỹ thuật</label>
            <input name="spec" defaultValue={pkg?.spec ?? ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Ghi chú / Tag</label>
            <input name="note" defaultValue={pkg?.note ?? ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Công suất</label>
              <input name="cap" required defaultValue={pkg?.cap ?? ''} placeholder="VD: 5 kWp" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Số tấm pin</label>
              <input name="panels" required defaultValue={pkg?.panels ?? ''} placeholder="VD: 10 tấm" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Biến tần</label>
              <input name="inv" required defaultValue={pkg?.inv ?? ''} placeholder="VD: 5kW" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            {isHybrid ? (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Pin lưu trữ</label>
                <input name="bat" defaultValue={pkg?.bat ?? ''} placeholder="VD: 51.2V/100AH" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            ) : (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phù hợp</label>
                <input name="fit" defaultValue={pkg?.fit ?? ''} placeholder={`VD: Hóa đơn ${formatVnd(500_000)} - ${formatVnd(1_500_000)}`} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Giá tham khảo (VNĐ)</label>
            <input name="price" required type="text" inputMode="numeric" defaultValue={pkg?.price ? formatNumberWithDots(pkg.price) : ''} placeholder={`VD: ${formatNumberWithDots(47_300_000)}`} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </>
      )}

      <button type="submit" className="w-full py-2.5 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">
        {isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
      </button>
    </form>
  )
}

function PackageModal({ tab, pkg, onClose }: { tab: Tab; pkg?: PricingPackage; onClose: () => void }) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">{pkg ? 'Chỉnh sửa' : 'Thêm mới'}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-900"><X className="w-5 h-5" /></button>
      </div>
      <PackageForm tab={tab} pkg={pkg} onClose={onClose} />
    </ModalOverlay>
  )
}

function PackageTable({ tab, initialRows }: { tab: Tab; initialRows: PricingPackage[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initialRows)
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [dropTargetId, setDropTargetId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()
  const [modal, setModal] = useState<{ open: boolean; pkg?: PricingPackage }>({ open: false })

  useEffect(() => { setItems(initialRows) }, [initialRows])

  const orderedIds = useMemo(() => items.map((item) => item.id), [items])

  const persistOrder = (nextItems: PricingPackage[]) => {
    startTransition(async () => {
      await reorderPricingPackages(nextItems.map((item) => item.id))
      router.refresh()
    })
  }

  const handleDrop = (targetId: number) => {
    if (!draggedId) return
    const nextItems = moveItem(items, draggedId, targetId)
    setItems(nextItems)
    setDraggedId(null)
    setDropTargetId(null)
    if (nextItems.map((item) => item.id).join(',') !== orderedIds.join(',')) {
      persistOrder(nextItems)
    }
  }

  const isVatTu = tab === 'vat-tu'
  const isHybrid = tab === 'hybrid'
  const categoryLabel = (cat: string | null) => VAT_TU_CATEGORIES.find((c) => c.id === cat)?.label ?? cat ?? '—'

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />Thêm dòng
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className={`grid text-xs text-gray-500 font-medium bg-gray-50 border-b border-gray-200 px-4 py-3 ${isVatTu ? 'grid-cols-[2rem_1fr_1fr_2fr_6rem_5rem]' : 'grid-cols-[2rem_1fr_1fr_1fr_1fr_7rem_5rem]'}`}>
          <div />
          {isVatTu ? (
            <>
              <div>Danh mục</div>
              <div>Sản phẩm</div>
              <div>Thông số</div>
              <div>Ghi chú</div>
            </>
          ) : (
            <>
              <div>Công suất</div>
              <div>Số tấm</div>
              <div>Biến tần</div>
              <div>{isHybrid ? 'Pin lưu trữ' : 'Phù hợp'}</div>
              <div className="text-right">Giá tham khảo</div>
            </>
          )}
          <div />
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              Chưa có dữ liệu. Bấm &quot;Thêm dòng&quot; để tạo mới.
            </div>
          ) : (
            items.map((row) => (
              <div
                key={row.id}
                draggable
                onDragStart={(e) => {
                  setDraggedId(row.id)
                  e.dataTransfer.effectAllowed = 'move'
                  e.dataTransfer.setData('text/plain', String(row.id))
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                  setDropTargetId(row.id)
                }}
                onDragLeave={() => setDropTargetId((cur) => (cur === row.id ? null : cur))}
                onDrop={(e) => { e.preventDefault(); handleDrop(row.id) }}
                onDragEnd={() => { setDraggedId(null); setDropTargetId(null) }}
                className={`grid items-center px-4 py-2.5 transition-colors text-sm ${isVatTu ? 'grid-cols-[2rem_1fr_1fr_2fr_6rem_5rem]' : 'grid-cols-[2rem_1fr_1fr_1fr_1fr_7rem_5rem]'} ${
                  dropTargetId === row.id ? 'bg-green-50' : 'hover:bg-gray-50'
                } ${draggedId === row.id ? 'opacity-50' : ''}`}
              >
                <button
                  type="button"
                  className="cursor-grab p-1 text-gray-300 hover:text-gray-500 active:cursor-grabbing"
                  title="Kéo để đổi thứ tự"
                >
                  <GripVertical className="w-4 h-4" />
                </button>

                {isVatTu ? (
                  <>
                    <div className="text-gray-500 text-xs">{categoryLabel(row.category)}</div>
                    <div className="text-gray-900 font-medium truncate pr-2">{row.name}</div>
                    <div className="text-gray-500 text-xs truncate pr-2">{row.spec}</div>
                    <div>
                      {row.note && (
                        <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full border border-emerald-200">
                          {row.note}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-bold text-teal-700 text-xs">{row.cap}</div>
                    <div className="text-gray-600 text-xs">{row.panels}</div>
                    <div className="text-gray-600 text-xs">{row.inv}</div>
                    <div className="text-gray-500 text-xs">{isHybrid ? row.bat : row.fit}</div>
                    <div className="text-gray-900 font-bold text-right text-xs">{formatPrice(row.price)}</div>
                  </>
                )}

                <div className="flex items-center gap-1 justify-end">
                  <button
                    onClick={() => setModal({ open: true, pkg: row })}
                    className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"
                    title="Sửa"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <form action={deletePricingPackage.bind(null, row.id)}>
                    <button type="submit" className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Xoá">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>

        {isPending && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
            Đang lưu thứ tự...
          </div>
        )}
      </div>

      {modal.open && (
        <PackageModal tab={tab} pkg={modal.pkg} onClose={() => setModal({ open: false })} />
      )}
    </div>
  )
}

export default function PricingManager({
  assumptions,
  hoaLuoi,
  giaDinh,
  doanhNghiep,
  hybrid,
  vatTu,
}: {
  assumptions: QuoteAssumptions
  hoaLuoi: PricingPackage[]
  giaDinh: PricingPackage[]
  doanhNghiep: PricingPackage[]
  hybrid: PricingPackage[]
  vatTu: PricingPackage[]
}) {
  const [activeTab, setActiveTab] = useState<Tab>('bao-gia-uoc-tinh')

  const packageTabs: Exclude<Tab, 'bao-gia-uoc-tinh'>[] = ['hoa-luoi', 'gia-dinh', 'doanh-nghiep', 'hybrid', 'vat-tu']
  const dataMap: Record<Exclude<Tab, 'bao-gia-uoc-tinh'>, PricingPackage[]> = {
    'hoa-luoi': hoaLuoi,
    'gia-dinh': giaDinh,
    'doanh-nghiep': doanhNghiep,
    hybrid,
    'vat-tu': vatTu,
  }

  return (
    <div>
      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`cursor-pointer whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2 ${
              activeTab === t.id
                ? 'text-green-700 border-green-600 bg-green-50'
                : 'text-gray-500 border-transparent hover:text-gray-900'
            }`}
          >
            {t.label}
            {t.id !== 'bao-gia-uoc-tinh' && (
              <span className="ml-1.5 text-xs text-gray-400">({dataMap[t.id as Exclude<Tab, 'bao-gia-uoc-tinh'>].length})</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'bao-gia-uoc-tinh' ? (
        <AdminQuoteSettingsForm assumptions={assumptions} />
      ) : (
        <PackageTable key={activeTab} tab={activeTab} initialRows={dataMap[activeTab as Exclude<Tab, 'bao-gia-uoc-tinh'>]} />
      )}
    </div>
  )
}
