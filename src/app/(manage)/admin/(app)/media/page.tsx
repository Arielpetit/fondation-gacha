import { requireAdmin } from '@/admin/server'
import { MediaLibrary } from '@/components/manage/MediaLibrary'
import { PageHeader } from '@/components/manage/ui'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Médiathèque' }

export default async function MediaPage() {
  const { payload } = await requireAdmin()
  const total = (await payload.count({ collection: 'media' })).totalDocs
  return (
    <>
      <PageHeader title="Médiathèque" description={`${total} fichiers. Glissez des photos ici pour les ajouter; cliquez sur une photo pour modifier son texte alternatif.`} />
      <MediaLibrary />
    </>
  )
}
