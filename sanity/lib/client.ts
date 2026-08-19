import {createClient} from 'next-sanity'

import {apiVersion, dataset, projectId} from '../env'

/**
 * The read-only client every server component fetches through.
 *
 * The token is sent on every read so the site works whether the dataset is
 * public or private — flipping that setting in Sanity should not be able to
 * take the site down. It is safe here because `SANITY_API_READ_TOKEN` has no
 * NEXT_PUBLIC_ prefix: Next replaces it with undefined in anything bundled for
 * the browser, so this module must only ever be imported from server code.
 *
 * `perspective: 'published'` matters more once a token is involved. A token
 * can see drafts, and without this an unpublished article would render on the
 * live site the moment someone started writing it.
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
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
  perspective: 'published',
  // Off by default and switched on per request in draft mode only. Stega
  // encodes field ids into the text as invisible characters so the
  // Presentation tool can map a click on the page back to a field in the
  // Studio; in published output those characters are corruption that would
  // travel into search results and copied text.
  stega: {studioUrl: '/studio', enabled: false},
})
