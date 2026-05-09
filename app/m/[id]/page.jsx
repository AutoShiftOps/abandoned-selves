import { createAdminClient } from '../../../lib/supabase-server'
import { notFound } from 'next/navigation'
import PublicMuseumViewer from '../../../components/PublicMuseumViewer'

export async function generateMetadata({ params }) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('museums')
    .select('selves')
    .eq('slug', params.id)
    .eq('is_public', true)
    .single()

  if (!data) return { title: 'Museum Not Found' }

  const firstSelf = data.selves[0]
  return {
    title: `${firstSelf} — Almost Became`,
    description: `A museum exhibit for the life almost lived: ${firstSelf}.`,
    openGraph: {
      title: `${firstSelf} — Almost Became`,
      description: 'A museum for the lives you almost lived.',
    },
  }
}

export default async function SharedMuseumPage({ params }) {
  const supabase = createAdminClient()

  const { data: museum, error } = await supabase
    .from('museums')
    .select('*')
    .eq('slug', params.id)
    .eq('is_public', true)
    .single()

  if (error || !museum) notFound()

  return <PublicMuseumViewer museum={museum} />
}