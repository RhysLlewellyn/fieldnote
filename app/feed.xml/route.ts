import {sanityFetchPublished} from '@/sanity/lib/fetch'
import {articlesQuery} from '@/sanity/lib/queries'
import type {ArticleCard} from '@/sanity/lib/types'

import {getSiteSettings} from '../lib/site'
import {siteUrl} from '../lib/site-url'

/**
 * The RSS feed.
 *
 * Prerendered rather than rendered per request, and tagged like every other
 * read, so the publish webhook expires it along with the pages. A feed that
 * lags the site by a day is worse than no feed.
 */
export const dynamic = 'force-static'

/** How many items a reader wants on first subscribe. */
const ITEM_LIMIT = 20

/**
 * XML has five reserved characters and an article title will eventually
 * contain every one of them. Escaping is not optional: a stray ampersand in a
 * headline is enough to make the whole feed unparseable.
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const base = siteUrl()

  const [articles, settings] = await Promise.all([
    // The same query the article index uses. A feed built from its own query
    // is a second definition of "what is published" waiting to disagree.
    sanityFetchPublished<ArticleCard[]>({
      query: articlesQuery,
      tags: ['article', 'author', 'topic', 'issue'],
    }),
    getSiteSettings(),
  ])

  const title = settings?.title ?? 'Fieldnote'
  const description =
    settings?.description ??
    'A quarterly about places, the people who work them, and what gets written down.'

  const items = articles
    .slice(0, ITEM_LIMIT)
    .map((article) => {
      const url = `${base}/articles/${article.slug}`
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(url)}</link>
      <description>${escapeXml(article.standfirst)}</description>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
    </item>`
    })
    .join('\n')

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(base)}</link>
    <description>${escapeXml(description)}</description>
    <language>en-GB</language>
    <atom:link href="${escapeXml(`${base}/feed.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`

  return new Response(feed, {
    headers: {'Content-Type': 'application/rss+xml; charset=utf-8'},
  })
}
