import Link from 'next/link'

import {getSiteSettings} from '@/app/lib/site'

export async function SiteHeader() {
  const settings = await getSiteSettings()

  return (
    <header className="border-b border-black/10 dark:border-white/15">
      <div className="mx-auto flex max-w-5xl flex-wrap items-baseline justify-between gap-x-8 gap-y-3 px-5 py-5">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {settings?.title ?? 'Fieldnote'}
        </Link>

        {settings?.navigation?.length ? (
          <nav aria-label="Main">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {settings.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="underline-offset-4 hover:underline"
                  >
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
