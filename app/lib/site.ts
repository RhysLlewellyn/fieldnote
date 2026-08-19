import {cache} from 'react'

import {sanityFetch} from '@/sanity/lib/fetch'
import {siteSettingsQuery} from '@/sanity/lib/queries'
import type {SiteSettings} from '@/sanity/lib/types'

/**
 * Site settings, fetched once per request.
 *
 * The header, the footer and generateMetadata all want this, and all three run
 * for every page. `cache` collapses them into one request.
 *
 * It can return null: the document does not exist until someone opens the
 * Studio and saves it, and a site that crashes on a fresh dataset is a bad
 * first impression. Callers fall back rather than assume.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings | null> =>
  sanityFetch<SiteSettings | null>({
    query: siteSettingsQuery,
    tags: ['siteSettings'],
  }),
)
