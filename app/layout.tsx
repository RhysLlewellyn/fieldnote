import type {Metadata} from 'next'
import {Geist, Geist_Mono} from 'next/font/google'

import {getSiteSettings} from './lib/site'
import './globals.css'

const geistSans = Geist({variable: '--font-geist-sans', subsets: ['latin']})
const geistMono = Geist_Mono({variable: '--font-geist-mono', subsets: ['latin']})

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
 * The Studio is served from this same app at /studio, and it draws its own
 * full-screen interface. Anything put here — a header, a footer, a max-width —
 * would be drawn around the Studio as well, which is not what anyone wants.
 * The site's own chrome lives in the (site) route group instead.
 */
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
