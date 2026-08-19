import type {Metadata} from 'next'
import {draftMode} from 'next/headers'
import {VisualEditing} from 'next-sanity/visual-editing'

import {DraftModeBanner} from '@/app/components/DraftModeBanner'
import {SiteFooter} from '@/app/components/SiteFooter'
import {SiteHeader} from '@/app/components/SiteHeader'
import {siteUrl} from '@/app/lib/site-url'

/**
 * Advertises the feed to readers and to anything that looks for one. It sits
 * on the (site) group rather than the root layout so the Studio, which is an
 * application and has nothing to syndicate, does not claim to have a feed.
 */
export const metadata: Metadata = {
  alternates: {
    types: {
      'application/rss+xml': [{url: `${siteUrl()}/feed.xml`, title: 'Fieldnote'}],
    },
  },
}

/**
 * The chrome every page of the site proper gets: header, footer, and a main
 * landmark between them. The Studio sits outside this group and so gets none
 * of it.
 *
 * VisualEditing is what makes the Presentation tool interactive — it reads the
 * stega-encoded ids in the rendered text and turns them into click targets
 * that open the right field in the Studio. It is mounted only in draft mode,
 * so a reader never downloads it.
 */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const {isEnabled: isDraft} = await draftMode()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Visible only once focused, which is the point: a keyboard reader
          should not have to tab through the whole nav on every page. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:font-meta focus:text-[0.7rem] focus:tracking-[0.14em] focus:text-paper focus:uppercase"
      >
        Skip to content
      </a>

      {isDraft ? <DraftModeBanner /> : null}
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      {isDraft ? <VisualEditing /> : null}
    </div>
  )
}
