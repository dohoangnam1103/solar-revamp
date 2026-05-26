'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { updateAdminUser, type AdminFormState } from '@/app/actions/admin-users'
import { Save, Loader2, AlertCircle, CheckCircle, Pencil, X } from 'lucide-react'

const INITIAL: AdminFormState = {}
const POPOVER_GAP = 8

type PopoverPosition = {
  right: number
  top?: number
  bottom?: number
}

type Props = {
  admin: { id: number; email: string; isSuper: boolean }
  canEditEmail: boolean
  canEditPassword: boolean
}

export default function EditAdminRow({ admin, canEditEmail, canEditPassword }: Props) {
  const action = updateAdminUser.bind(null, admin.id)
  const [state, formAction, pending] = useActionState(action, INITIAL)
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState<PopoverPosition | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return

    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return

      const width = Math.min(320, window.innerWidth - 24)
      const right = Math.max(12, Math.min(window.innerWidth - rect.right, window.innerWidth - width - 12))
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top

      if (spaceBelow < 300 && spaceAbove > spaceBelow) {
        setPosition({ right, bottom: window.innerHeight - rect.top + POPOVER_GAP })
        return
      }

      setPosition({ right, top: rect.bottom + POPOVER_GAP })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (buttonRef.current?.contains(target) || popoverRef.current?.contains(target)) return
      setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  if (!canEditEmail && !canEditPassword) return null

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="p-1.5 text-gray-400 transition-colors hover:text-green-700"
        aria-expanded={open}
        title="Sửa"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      {mounted && open && position &&
        createPortal(
          <EditPopover
            admin={admin}
            canEditEmail={canEditEmail}
            canEditPassword={canEditPassword}
            formAction={formAction}
            pending={pending}
            position={position}
            state={state}
            ref={popoverRef}
            onClose={() => setOpen(false)}
          />,
          document.body
        )}
    </>
  )
}

function EditPopover({
  admin,
  canEditEmail,
  canEditPassword,
  formAction,
  pending,
  position,
  state,
  ref,
  onClose,
}: {
  admin: Props['admin']
  canEditEmail: boolean
  canEditPassword: boolean
  formAction: (payload: FormData) => void
  pending: boolean
  position: PopoverPosition
  state: AdminFormState
  ref: React.RefObject<HTMLDivElement | null>
  onClose: () => void
}) {
  return (
    <div
      ref={ref}
      className="fixed z-50 max-h-[calc(100vh-1.5rem)] w-[min(20rem,calc(100vw-1.5rem))] overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 shadow-2xl"
      style={position}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">Sửa #{admin.id}</h4>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form action={formAction} className="space-y-3">
        {canEditEmail ? (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Email</label>
            <input
              name="email"
              type="email"
              defaultValue={admin.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        ) : (
          <div className="text-xs text-gray-500">
            Email cố định: <span className="font-medium text-gray-700">{admin.email}</span>
          </div>
        )}
        {canEditPassword && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mật khẩu mới (để trống nếu không đổi)</label>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        )}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Lưu
        </button>
        {state.error && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            {state.success}
          </div>
        )}
      </form>
    </div>
  )
}
