import {SiteFooter} from '@/app/components/SiteFooter'
import {SiteHeader} from '@/app/components/SiteHeader'

/**
 * The chrome every page of the site proper gets: header, footer, and a main
 * landmark between them. The Studio sits outside this group and so gets none
 * of it.
 */
export default function SiteLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
