import {createClient} from 'next-sanity'

import {apiVersion, dataset, projectId} from '../env'

/**
 * The read-only client every server component fetches through.
 *
 * `useCdn` is off deliberately. Next's data cache already holds the responses
 * and the webhook at /api/revalidate clears them the moment an editor
 * publishes. Leaving the CDN on would put a second cache in front of that one
 * that the webhook cannot reach, so a published change would sit invisible for
 * as long as the CDN felt like holding it.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'published',
})
