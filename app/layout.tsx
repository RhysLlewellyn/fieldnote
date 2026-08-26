import type {Metadata} from 'next'
import {Analytics} from '@vercel/analytics/next'
import {IBM_Plex_Mono, Newsreader} from 'next/font/google'
import localFont from 'next/font/local'

import {getSiteSettings} from './lib/site'
import './globals.css'

/**
 * Three faces, each doing one job: Zodiak for display, Newsreader for reading,
 * Plex Mono for metadata. Newsreader carries an italic because the standfirst
 * is set in it.
 *
 * Zodiak comes from Fontshare rather than Google Fonts, and is loaded from
 * disk rather than by name. `scripts/fetch-fonts.mjs` puts it there; the file
 * is not in the repo, and that script explains why. Its one axis is weight,
 * which the art direction uses at 300, 400 and 500, so the variable cut is
 * both the smallest and the most flexible option.
 *
 * `adjustFontFallback` is what holds CLS at 0 through the swap: Next derives
 * a size-adjusted @font-face from Times New Roman's metrics, so the fallback
 * occupies the same space as the real face and nothing reflows when it lands.
 * Georgia follows it for the case where neither is available.
 */
const display = localFont({
  src: './fonts/Zodiak-Variable.woff2',
  variable: '--font-zodiak',
  display: 'swap',
  weight: '100 900',
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: 'Times New Roman',
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
     * `@theme` declares --font-display as `var(--font-zodiak), Georgia,
     * serif` on :root. A custom property is substituted where it is declared,
     * not where it is used, so with --font-zodiak defined on <body> the
     * reference resolves against :root, finds nothing, and --font-display
     * computes to an invalid value that every element then inherits. The
     * result is the whole site quietly falling back to Tailwind's default
     * sans stack while the CSS all looks correct.
     */
    <html
      lang="en-GB"
      className={`${display.variable} ${body.variable} ${meta.variable}`}
    >
      <body className="antialiased">{children}<Analytics /></body>
    </html>
  )
}
