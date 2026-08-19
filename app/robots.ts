import type {MetadataRoute} from 'next'

import {siteUrl} from './lib/site-url'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The Studio is an application, not content. Crawling it wastes budget
      // on a route that renders nothing without a login, and the draft-mode
      // routes are endpoints rather than pages.
      disallow: ['/studio', '/api/'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
