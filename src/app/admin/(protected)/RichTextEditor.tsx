'use client'

import { useState } from 'react'
import Link from '@tiptap/extension-link'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Redo2,
  RotateCcw,
  Undo2,
} from 'lucide-react'

type RichTextEditorProps = {
  name: string
  defaultValue?: string
  minHeightClassName?: string
}

type ToolbarButtonProps = {
  active?: boolean
  disabled?: boolean
  label: string
  onClick: () => void
  children: React.ReactNode
}

function isTiptapDocument(value: string) {
  if (!value.trim().startsWith('{')) return false

  try {
    const parsed = JSON.parse(value)
    return parsed?.type === 'doc'
  } catch {
    return false
  }
}

function legacyTextToHtml(value: string) {
  const escapeHtml = (text: string) =>
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')

  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

function getInitialContent(value: string) {
  return isTiptapDocument(value) ? JSON.parse(value) : legacyTextToHtml(value)
}

function ToolbarButton({ active, disabled, label, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md p-1.5 transition-colors ${
        active
          ? 'bg-green-100 text-green-800'
          : 'text-gray-600 hover:bg-white hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40'
      }`}
      title={label}
    >
      {children}
    </button>
  )
}

export default function RichTextEditor({
  name,
  defaultValue = '',
  minHeightClassName = 'min-h-48',
}: RichTextEditorProps) {
  const [serializedContent, setSerializedContent] = useState(defaultValue)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        autolink: true,
        defaultProtocol: 'https',
        openOnClick: false,
        protocols: ['http', 'https', 'mailto', 'tel'],
      }),
    ],
    content: getInitialContent(defaultValue),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `rich-text-editor-content ${minHeightClassName} px-3 py-2 text-sm leading-6 outline-none`,
      },
    },
    onCreate: ({ editor }) => {
      setSerializedContent(JSON.stringify(editor.getJSON()))
    },
    onUpdate: ({ editor }) => {
      setSerializedContent(JSON.stringify(editor.getJSON()))
    },
  })

  const setLink = () => {
    if (!editor) return

    const current = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Nhập link', current || '')

    if (url === null) return
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
      <input type="hidden" name={name} value={serializedContent} />
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <ToolbarButton
          active={editor?.isActive('bold')}
          disabled={!editor}
          label="In đậm"
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('italic')}
          disabled={!editor}
          label="In nghiêng"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('heading', { level: 2 })}
          disabled={!editor}
          label="Tiêu đề lớn"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('heading', { level: 3 })}
          disabled={!editor}
          label="Tiêu đề nhỏ"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('bulletList')}
          disabled={!editor}
          label="Danh sách"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('orderedList')}
          disabled={!editor}
          label="Danh sách đánh số"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('link')}
          disabled={!editor}
          label="Link"
          onClick={setLink}
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          disabled={!editor}
          label="Ngắt dòng"
          onClick={() => editor?.chain().focus().setHardBreak().run()}
        >
          <RotateCcw className="h-4 w-4 -rotate-90" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-gray-200" />
        <ToolbarButton
          disabled={!editor || !editor.can().undo()}
          label="Hoàn tác"
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          disabled={!editor || !editor.can().redo()}
          label="Làm lại"
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
