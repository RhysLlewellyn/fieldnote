import Link from 'next/link'

import {sanityFetch} from '@/sanity/lib/fetch'
import {homeQuery} from '@/sanity/lib/queries'
import type {HomePage} from '@/sanity/lib/types'

import {ArticleIndex} from '@/app/components/ArticleIndex'
import {RisoArt} from '@/app/components/RisoArt'
import {formatMonthYear} from '@/app/lib/format'
import {getSiteSettings} from '@/app/lib/site'

export default async function HomePage() {
  const [{featured, recent, latestIssue}, settings] = await Promise.all([
    sanityFetch<HomePage>({
      query: homeQuery,
      tags: ['article', 'issue', 'author', 'topic'],
    }),
    getSiteSettings(),
  ])

  // The query cannot exclude the featured article from `recent` — it fetches
  // one extra instead, and the duplicate comes out here.
  const rest = recent.filter((a) => a._id !== featured?._id).slice(0, 12)

  if (!featured && rest.length === 0) {
    return (
      <div className="mx-auto max-w-[1100px] px-8 py-24">
        <p className="text-muted">
          Nothing published yet. Write the first article in{' '}
          <Link href="/studio" className="text-ochre underline underline-offset-4">
            the Studio
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1100px] px-8">
      <header className="pt-14 pb-10">
        <h1 className="font-display text-[clamp(3.5rem,11vw,9rem)] leading-[0.86] font-light tracking-[-0.035em]">
          {settings?.title ?? 'Fieldnote'}
        </h1>
        {settings?.description ? (
          <p className="mt-6 max-w-[34rem] text-[1.3rem] leading-[1.5] italic">
            {settings.description}
          </p>
        ) : null}
      </header>

      {featured ? (
        <section className="border-t border-rule pt-10">
          <h2 className="sr-only">Latest</h2>

          <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14">
            <Link
              href={`/articles/${featured.slug}`}
              className="block aspect-[8/5] overflow-hidden md:aspect-[4/5]"
            >
              <RisoArt seed={featured.slug} width={640} height={800} />
            </Link>

            <div className="self-center">
              {featured.topics?.[0] ? (
                <p className="font-meta text-[0.7rem] tracking-[0.14em] text-ochre uppercase">
                  {featured.topics[0].title}
                </p>
              ) : null}

              <h3 className="font-display mt-3 text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.02] font-light tracking-[-0.028em] text-balance">
                <Link href={`/articles/${featured.slug}`} className="hover:text-ochre">
                  {featured.title}
                </Link>
              </h3>

              <p className="mt-5 max-w-[34rem] text-[1.3rem] leading-[1.5] italic">
                {featured.standfirst}
              </p>

              <p className="mt-6 font-meta text-[0.7rem] tracking-[0.14em] text-muted uppercase">
                {[
                  featured.author?.name && `Words — ${featured.author.name}`,
                  `${featured.readingTime} min`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {rest.length ? (
        <section className="mt-20">
          <h2 className="mb-5 font-meta text-[0.7rem] tracking-[0.14em] text-muted uppercase">
            In this issue and before
          </h2>
          <ArticleIndex articles={rest} startAt={featured ? 2 : 1} />
        </section>
      ) : null}

      {latestIssue ? (
        <section className="mt-20 flex flex-wrap items-baseline justify-between gap-x-10 gap-y-3 border-t border-rule pt-8">
          <div>
            <p className="font-meta text-[0.7rem] tracking-[0.14em] text-muted uppercase">
              Current issue
            </p>
            <h2 className="font-display mt-2 text-[1.75rem] leading-[1.15] tracking-[-0.02em]">
              <Link href={`/issues/${latestIssue.slug}`} className="hover:text-ochre">
                {String(latestIssue.number).padStart(2, '0')} — {latestIssue.title}
              </Link>
            </h2>
          </div>

          <p className="font-meta text-[0.7rem] tracking-[0.14em] text-muted uppercase">
            <time dateTime={latestIssue.publishedAt}>
              {formatMonthYear(latestIssue.publishedAt)}
            </time>
            {' · '}
            <Link href="/issues" className="hover:text-ochre">
              All issues
            </Link>
          </p>
        </section>
      ) : null}
    </div>
  )
}
