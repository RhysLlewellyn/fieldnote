import type {MetadataRoute} from 'next'

import {sanityFetchPublished} from '@/sanity/lib/fetch'
import {
  articleSlugsQuery,
  authorSlugsQuery,
  issueSlugsQuery,
  pageSlugsQuery,
  topicSlugsQuery,
} from '@/sanity/lib/queries'

import {siteUrl} from './lib/site-url'

/**
 * Built from the same slug queries the routes prerender from, so the sitemap
 * cannot list a page that does not exist or miss one that does.
 *
 * It uses the published-only fetch deliberately: a sitemap describing drafts
 * would advertise unpublished work to crawlers.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()

  const [articles, issues, topics, authors, pages] = await Promise.all([
    sanityFetchPublished<string[]>({query: articleSlugsQuery, tags: ['article']}),
    sanityFetchPublished<string[]>({query: issueSlugsQuery, tags: ['issue']}),
    sanityFetchPublished<string[]>({query: topicSlugsQuery, tags: ['topic']}),
    sanityFetchPublished<string[]>({query: authorSlugsQuery, tags: ['author']}),
    sanityFetchPublished<string[]>({query: pageSlugsQuery, tags: ['page']}),
  ])

  const entries = (prefix: string, slugs: string[], priority: number) =>
    slugs.map((slug) => ({
      url: `${base}${prefix}${slug}`,
      priority,
    }))

  return [
    {url: base, priority: 1},
    {url: `${base}/issues`, priority: 0.8},
    {url: `${base}/topics`, priority: 0.6},
    ...entries('/articles/', articles, 0.9),
    ...entries('/issues/', issues, 0.7),
    ...entries('/topics/', topics, 0.5),
    ...entries('/authors/', authors, 0.5),
    ...entries('/', pages, 0.4),
  ]
}
