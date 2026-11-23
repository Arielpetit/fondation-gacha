import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

/** GET /next/exit-preview?path=/… — leaves draft mode and returns to the published page. */
export async function GET(req: Request) {
  const path = new URL(req.url).searchParams.get('path') || '/'
  const draft = await draftMode()
  draft.disable()
  redirect(path.startsWith('/') && !path.startsWith('//') ? path : '/')
}
