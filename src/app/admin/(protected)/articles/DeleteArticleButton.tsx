'use client'

import { useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteArticle } from '@/app/actions/admin-crud'

export default function DeleteArticleButton({ articleId }: { articleId: number }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => deleteArticle(articleId))}
      disabled={isPending}
      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
    >
      {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  )
}
