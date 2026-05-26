import { getArticle } from '@/app/actions/admin-crud'
import { notFound } from 'next/navigation'
import EditArticleForm from './EditArticleForm'

type Props = { params: Promise<{ id: string }> }

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params
  const article = await getArticle(parseInt(id))
  if (!article) notFound()

  return <EditArticleForm article={article} />
}
