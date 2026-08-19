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
 * Every read from Sanity goes through here.
 *
 * There is no time-based revalidation on purpose. A magazine article is not
 * stale sixty seconds after it was fetched — it is stale when an editor
 * changes it, and the webhook says so. Polling on a timer would spend requests
 * to re-fetch identical content and still show the old version for up to a
 * minute after a real change.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags,
}: FetchOptions): Promise<T> {
  return client.fetch<T>(query, params, {
    next: {revalidate: false, tags},
  })
}
