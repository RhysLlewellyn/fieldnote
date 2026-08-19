import {getSiteSettings} from '@/app/lib/site'

export async function SiteFooter() {
  const settings = await getSiteSettings()

  return (
    <footer className="mt-20 border-t border-black/10 dark:border-white/15">
      <div className="mx-auto flex max-w-5xl flex-wrap items-baseline justify-between gap-x-8 gap-y-3 px-5 py-8 text-sm text-black/60 dark:text-white/60">
        <p>{settings?.footerText ?? null}</p>

        {settings?.socialLinks?.length ? (
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {settings.socialLinks.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  className="underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </footer>
  )
}
