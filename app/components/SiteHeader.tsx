import Link from 'next/link'

import {getSiteSettings} from '@/app/lib/site'

/**
 * A hairline rule and whitespace, no more. The masthead proper lives on the
 * homepage; every other page gets the wordmark small so the article's own
 * title is the largest thing on the screen.
 */
export async function SiteHeader() {
  const settings = await getSiteSettings()

  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-baseline justify-between gap-x-10 gap-y-3 px-8 py-5">
        <Link
          href="/"
          className="font-display text-[1.35rem] font-normal tracking-[-0.02em] hover:text-ochre"
        >
          {settings?.title ?? 'Fieldnote'}
        </Link>

        {settings?.navigation?.length ? (
          <nav aria-label="Main">
            <ul className="flex flex-wrap gap-x-7 gap-y-2 font-meta text-[0.7rem] tracking-[0.14em] uppercase">
              {settings.navigation.map((item) => (
                <li key={item.href}>
                  {/* py-1 takes the target from ~18px to ~26px tall. At
                      0.7rem the text alone is under the 24px WCAG 2.2 asks
                      for, and these are the links a phone user reaches for
                      most. */}
                  <Link href={item.href} className="block py-1 hover:text-ochre">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  )
}
