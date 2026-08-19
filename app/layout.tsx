import type {Metadata} from 'next'
import {Fraunces, IBM_Plex_Mono, Newsreader} from 'next/font/google'

import {getSiteSettings} from './lib/site'
import './globals.css'

/**
 * Three faces, each doing one job: Fraunces for display, Newsreader for
 * reading, Plex Mono for metadata.
 *
 * Fraunces is loaded with its SOFT and WONK axes because they are the point of
 * choosing it — a wonky, soft-terminalled serif rather than another Georgia.
 * Newsreader carries an italic because the standfirst is set in it.
 */
const display = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  display: 'swap',
  axes: ['SOFT', 'WONK'],
})

const body = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
})

const meta = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
  // Preloaded, despite only ever setting metadata. Deferring it saved 10KB on
  // the critical path and cost a 0.24 layout shift: the navigation is set in
  // this face, it is materially wider than the Arial-based fallback, and
  // arriving late meant the header reflowed after the page had painted and
  // pushed everything below it down.
})

/**
 * The site name and description come from the Studio, so an editor can change
 * what appears in a browser tab without a deploy. The template puts the site
 * name after every page title; `default` covers pages that set none.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const title = settings?.title ?? 'Fieldnote'

  return {
    title: {default: title, template: `%s — ${title}`},
    description: settings?.description,
  }
}

/**
 * Deliberately bare: html, body and the fonts, and nothing else.
 *
 * The Studio is served from this same app at /studio and draws its own
 * full-screen interface. Anything put here — a header, a footer, a max-width —
 * would be drawn around the Studio as well. The site's own chrome lives in the
 * (site) route group instead.
 */
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    /**
     * The font variables go on <html>, not <body>.
     *
     * `@theme` declares --font-display as `var(--font-fraunces), Georgia,
     * serif` on :root. A custom property is substituted where it is declared,
     * not where it is used, so with --font-fraunces defined on <body> the
     * reference resolves against :root, finds nothing, and --font-display
     * computes to an invalid value that every element then inherits. The
     * result is the whole site quietly falling back to Tailwind's default
     * sans stack while the CSS all looks correct.
     */
    <html
      lang="en-GB"
      className={`${display.variable} ${body.variable} ${meta.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  )
}
