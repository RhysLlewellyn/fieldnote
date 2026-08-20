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
      {/* tabIndex={-1} is what makes the skip link above actually work.
          Without it <main> is not a focusable target, and browsers disagree
          about what to do: Chrome moves the sequential focus starting point
          and the next Tab lands inside the content, Firefox leaves focus at
          the top of the document, so a screen-reader user activates the skip
          link and still tabs through the whole nav. Found by pressing
          Tab-Enter-Tab in Firefox with NVDA running; an automated pass in
          Chrome reported it working.

          The outline is suppressed because this is a programmatic focus
          target rather than an operable control, and a 2px ring around the
          entire page is noise rather than information. */}
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <SiteFooter />
      {isDraft ? <VisualEditing /> : null}
    </div>
  )
}
