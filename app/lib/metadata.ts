import type {Metadata} from 'next'

import {urlForImage} from '@/sanity/lib/image'
import type {SanityImage, Seo} from '@/sanity/lib/types'

import {getSiteSettings} from './site'

/** The size every social platform crops to. */
const OG_WIDTH = 1200
const OG_HEIGHT = 630

/**
 * Build page metadata, falling back the way the `seo` schema promises editors
 * it will: an override is used if set, and otherwise the page's own title,
 * standfirst and cover image are used. Nothing here requires an editor to fill
 * the SEO tab in for a page to share properly.
 */
export async function buildMetadata({
  title,
  description,
  image,
  seo,
}: {
  title: string
  description?: string | null
  image?: SanityImage | null
  seo?: Seo | null
}): Promise<Metadata> {
  const settings = await getSiteSettings()
  const siteName = settings?.title ?? 'Fieldnote'

  const resolvedTitle = seo?.title || title
  const resolvedDescription =
    seo?.description || description || settings?.description || undefined

  const source = seo?.ogImage || image || settings?.defaultOgImage
  const ogImage = source
    ? urlForImage(source)
        .width(OG_WIDTH)
        .height(OG_HEIGHT)
        .fit('crop')
        .url()
    : undefined

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      siteName,
      type: 'article',
      ...(ogImage
        ? {images: [{url: ogImage, width: OG_WIDTH, height: OG_HEIGHT}]}
        : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: resolvedTitle,
      description: resolvedDescription,
      ...(ogImage ? {images: [ogImage]} : {}),
    },
  }
}
