import {draftMode} from 'next/headers'
import {redirect} from 'next/navigation'

/** Leaves preview and returns to the published site. */
export async function GET(request: Request) {
  const draft = await draftMode()
  draft.disable()

  // Back where the reader was, if we were told, and the homepage otherwise.
  const returnTo = new URL(request.url).searchParams.get('return') || '/'
  redirect(returnTo.startsWith('/') ? returnTo : '/')
}
