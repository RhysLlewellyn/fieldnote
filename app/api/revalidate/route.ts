import {parseBody} from 'next-sanity/webhook'
import {revalidateTag} from 'next/cache'
import {type NextRequest, NextResponse} from 'next/server'

/**
 * The other half of the caching strategy.
 *
 * Pages are cached indefinitely and tagged by document type and identity, so
 * nothing expires on its own. This is what tells them to: Sanity posts here
 * when a document is published, and the matching tags are cleared.
 *
 * `parseBody` checks the signature against the shared secret before anything
 * is trusted, and waits for Content Lake's eventual consistency — without
 * that wait, the rebuild triggered here can re-fetch the *old* document and
 * cache it again, which looks exactly like the webhook not firing.
 */
type WebhookPayload = {
  _type?: string
  /** A string if the webhook projects `slug.current`, the raw object if not. */
  slug?: string | {current?: string}
}

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET

  if (!secret) {
    // Refuse rather than fall back to accepting unsigned requests: without a
    // secret this route would let anyone force a rebuild at will.
    return new NextResponse('SANITY_REVALIDATE_SECRET is not set', {status: 500})
  }

  const {body, isValidSignature} = await parseBody<WebhookPayload>(request, secret)

  if (isValidSignature === false) {
    return new NextResponse('Invalid signature', {status: 401})
  }

  if (!body?._type) {
    // Answering 400 rather than shrugging keeps the failure visible in
    // Sanity's webhook log, where it can actually be diagnosed.
    return new NextResponse(
      'No _type in payload — the webhook projection must include it',
      {status: 400},
    )
  }

  const slug = typeof body.slug === 'string' ? body.slug : body.slug?.current

  // The type tag covers every list that could contain this document; the
  // identity tag covers the document's own page.
  const tags = slug ? [body._type, `${body._type}:${slug}`] : [body._type]

  // `{expire: 0}` rather than the usually-recommended 'max'. A cache-life
  // profile marks the tag stale and serves the stale copy while fetching
  // fresh data behind it, which means the editor who just hit publish loads
  // the page and sees the old version — and reasonably concludes the webhook
  // is broken. Expiring outright costs the next visitor one slower request
  // and makes publishing mean what it says.
  for (const tag of tags) revalidateTag(tag, {expire: 0})

  return NextResponse.json({revalidated: true, tags})
}
