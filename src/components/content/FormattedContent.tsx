import type { ReactNode } from 'react'
import { formatVietnameseCurrencyText } from '@/lib/quote/calculator'

type FormattedContentProps = {
  content: string
  className?: string
  paragraphClassName?: string
}

type TiptapMark = {
  type?: string
  attrs?: Record<string, unknown>
}

type TiptapNode = {
  type?: string
  text?: string
  attrs?: Record<string, unknown>
  marks?: TiptapMark[]
  content?: TiptapNode[]
}

const INLINE_TOKEN_PATTERN = /(\*\*[^*\n]+?\*\*|\*[^*\n]+?\*)/g
const ALLOWED_LINK_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:']

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const formattedText = formatVietnameseCurrencyText(text)
  const nodes: ReactNode[] = []
  let cursor = 0
  let match: RegExpExecArray | null

  INLINE_TOKEN_PATTERN.lastIndex = 0
  while ((match = INLINE_TOKEN_PATTERN.exec(formattedText)) !== null) {
    if (match.index > cursor) {
      nodes.push(formattedText.slice(cursor, match.index))
    }

    const token = match[0]
    const key = `${keyPrefix}-${match.index}`
    if (token.startsWith('**')) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>)
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>)
    }
    cursor = match.index + token.length
  }

  if (cursor < formattedText.length) {
    nodes.push(formattedText.slice(cursor))
  }

  return nodes
}

function renderLegacyParagraph(paragraph: string, keyPrefix: string) {
  const lines = paragraph.split('\n')
  return lines.flatMap((line, lineIndex) => {
    const nodes = parseInline(line, `${keyPrefix}-${lineIndex}`)
    if (lineIndex === lines.length - 1) return nodes
    return [...nodes, <br key={`${keyPrefix}-${lineIndex}-br`} />]
  })
}

function isSafeHref(href: string) {
  try {
    const url = new URL(href, 'https://soliq.com.vn')
    return ALLOWED_LINK_PROTOCOLS.includes(url.protocol)
  } catch {
    return false
  }
}

function applyMarks(node: ReactNode, marks: TiptapMark[] | undefined, keyPrefix: string) {
  return (marks || []).reduce((current, mark, index) => {
    const key = `${keyPrefix}-mark-${index}`
    if (mark.type === 'bold') return <strong key={key}>{current}</strong>
    if (mark.type === 'italic') return <em key={key}>{current}</em>
    if (mark.type === 'link') {
      const href = typeof mark.attrs?.href === 'string' ? mark.attrs.href : ''
      if (!isSafeHref(href)) return current

      return (
        <a key={key} href={href} rel="noopener noreferrer" target={href.startsWith('http') ? '_blank' : undefined}>
          {current}
        </a>
      )
    }
    return current
  }, node)
}

function renderTiptapChildren(nodes: TiptapNode[] | undefined, keyPrefix: string): ReactNode[] {
  return (nodes || []).map((node, index) => renderTiptapNode(node, `${keyPrefix}-${index}`))
}

function renderTiptapNode(node: TiptapNode, key: string): ReactNode {
  if (node.type === 'text') {
    return applyMarks(formatVietnameseCurrencyText(node.text || ''), node.marks, key)
  }

  if (node.type === 'hardBreak') {
    return <br key={key} />
  }

  const children = renderTiptapChildren(node.content, key)

  if (node.type === 'paragraph') {
    // Empty paragraphs (created by pressing Enter on a blank line in the editor)
    // have no children, so a normal <p> collapses to ~0 height and the spacing
    // looks much smaller than in the editor. Render a real blank line instead.
    const isEmpty = !node.content || node.content.length === 0
    if (isEmpty) {
      return <p key={key} className="leading-relaxed" aria-hidden="true">&nbsp;</p>
    }
    return (
      <p key={key} className="mb-4 leading-relaxed text-gray-700">
        {children}
      </p>
    )
  }

  if (node.type === 'heading') {
    const level = node.attrs?.level === 3 ? 3 : 2
    const className = level === 3
      ? 'mb-3 mt-6 text-xl font-bold text-gray-900'
      : 'mb-4 mt-8 text-2xl font-extrabold text-gray-900'

    return level === 3 ? (
      <h3 key={key} className={className}>{children}</h3>
    ) : (
      <h2 key={key} className={className}>{children}</h2>
    )
  }

  if (node.type === 'bulletList') {
    return (
      <ul key={key} className="mb-4 list-disc space-y-2 pl-6 text-gray-700">
        {children}
      </ul>
    )
  }

  if (node.type === 'orderedList') {
    return (
      <ol key={key} className="mb-4 list-decimal space-y-2 pl-6 text-gray-700">
        {children}
      </ol>
    )
  }

  if (node.type === 'listItem') {
    return <li key={key}>{children}</li>
  }

  return <span key={key}>{children}</span>
}

function parseTiptapDocument(content: string): TiptapNode | null {
  if (!content.trim().startsWith('{')) return null

  try {
    const parsed = JSON.parse(content)
    return parsed?.type === 'doc' ? parsed : null
  } catch {
    return null
  }
}

function renderLegacyContent(content: string, paragraphClassName: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={index} className={paragraphClassName}>
        {renderLegacyParagraph(paragraph, `paragraph-${index}`)}
      </p>
    ))
}

export default function FormattedContent({
  content,
  className,
  paragraphClassName = 'mb-4 leading-relaxed text-gray-700',
}: FormattedContentProps) {
  const tiptapDocument = parseTiptapDocument(content)

  return (
    <div className={className}>
      {tiptapDocument
        ? renderTiptapChildren(tiptapDocument.content, 'doc')
        : renderLegacyContent(content, paragraphClassName)}
    </div>
  )
}
