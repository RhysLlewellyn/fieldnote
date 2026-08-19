import {draftMode} from 'next/headers'
import type {QueryParams} from 'next-sanity'

import {client} from './client'

type FetchOptions = {
  query: string
  params?: QueryParams
  /**
   * Cache tags for this response. The webhook at /api/revalidate turns a
   * published document into the same tags and clears whatever carries them.
   *
   * Tag by document type ('article') and, where a page shows one specific
   * document, by identity too ('article:the-long-way-round'). A list page
   * takes only the type tag, because any article changing can change the list.
   */
  tags: string[]
}

/**
 * Retry a read that failed for network reasons.
 *
 * A production build prerenders every page at once — fifteen workers, several
 * queries each — and a burst like that reliably produces the occasional
 * connect timeout on a domestic connection. The client's own `maxRetries`
 * does not cover it: that timeout is thrown by the fetch layer underneath,
 * before the client sees a response to retry.
 *
 * A failure here fails the whole build, so it is worth three attempts and a
 * second of waiting to avoid pushing a red deploy over a dropped packet.
 */
async function withRetry<T>(read: () => Promise<T>): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await read()
    } catch (error) {
      lastError = error
      // 200ms, then 600ms. Long enough for a transient blip, short enough
      // that a genuinely broken connection still fails the build quickly.
      await new Promise((resolve) => setTimeout(resolve, 200 * 3 ** attempt))
    }
  }

  throw lastError
}

/**
 * Every read a page makes goes through here.
 *
 * Two modes. For a reader, responses are cached indefinitely and tagged, and
 * the publish webhook is what expires them — an article is not stale sixty
 * seconds after it was fetched, it is stale when an editor changes it.
 *
 * For an editor in draft mode nothing is cached and the drafts perspective is
 * used, so a preview shows unpublished work. Stega is switched on in that mode
 * only: it hides document and field ids inside the text as invisible
 * characters, which is how the Presentation tool knows which field a click on
 * the page belongs to. Those characters must never reach a reader — they
 * travel into copied text and search results — which is why the client has
 * stega off by default and it is turned on per request instead.
 */
export async function sanityFetch<T>(options: FetchOptions): Promise<T> {
  const {isEnabled: isDraft} = await draftMode()

  if (!isDraft) return sanityFetchPublished<T>(options)

  const {query, params = {}} = options
  return withRetry(() =>
    client.fetch<T>(query, params, {
      perspective: 'drafts',
      useCdn: false,
      stega: true,
      cache: 'no-store',
    }),
  )
}

/**
 * A read that never consults draft mode.
 *
 * `generateStaticParams` runs at build time with no HTTP request behind it, so
 * calling `draftMode()` there is an error rather than merely useless. It also
 * has no business seeing drafts: which pages to prerender is a question about
 * published content, and an unpublished article should not mint a URL.
 */
export async function sanityFetchPublished<T>({
  query,
  params = {},
  tags,
}: FetchOptions): Promise<T> {
  return withRetry(() =>
    client.fetch<T>(query, params, {
      next: {revalidate: false, tags},
    }),
  )
}
