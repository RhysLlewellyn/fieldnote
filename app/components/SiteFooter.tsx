import {getSiteSettings} from '@/app/lib/site'

export async function SiteFooter() {
  const settings = await getSiteSettings()

  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-3 px-8 py-8 font-meta text-[0.7rem] tracking-[0.14em] text-muted uppercase sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-10">
        <p>{settings?.footerText ?? null}</p>

        {settings?.socialLinks?.length ? (
          <ul className="flex flex-wrap gap-x-7 gap-y-2">
            {settings.socialLinks.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  className="block py-1 hover:text-ochre"
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
