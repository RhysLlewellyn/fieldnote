import Link from 'next/link'

import {sanityFetch} from '@/sanity/lib/fetch'
import {homeQuery} from '@/sanity/lib/queries'
import type {HomePage} from '@/sanity/lib/types'

import {ArticleCard} from '@/app/components/ArticleCard'
import {SanityImage} from '@/app/components/SanityImage'
import {formatDate} from '@/app/lib/format'

export default async function HomePage() {
  const {featured, recent, latestIssue} = await sanityFetch<HomePage>({
    query: homeQuery,
    tags: ['article', 'issue', 'author', 'topic'],
  })

  // The query cannot exclude the featured article from `recent` — it fetches
  // one extra instead, and the duplicate comes out here.
  const rest = recent.filter((a) => a._id !== featured?._id).slice(0, 12)

  if (!featured && rest.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-20">
        <p className="text-black/60 dark:text-white/60">
          Nothing published yet. Write the first article in{' '}
          <Link href="/studio" className="underline underline-offset-4">
            the Studio
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
      {featured ? (
        <section className="border-b border-black/10 pb-12 dark:border-white/15">
          <h1 className="sr-only">Latest</h1>
          <ArticleCard article={featured} lead priority />
        </section>
      ) : null}

      {rest.length ? (
        <section className="pt-12">
          <h2 className="mb-6 text-sm font-semibold tracking-wide uppercase text-black/55 dark:text-white/55">
            More from Fieldnote
          </h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        </section>
      ) : null}

      {latestIssue ? (
        <section className="mt-16 border-t border-black/10 pt-12 dark:border-white/15">
          <h2 className="mb-6 text-sm font-semibold tracking-wide uppercase text-black/55 dark:text-white/55">
            Current issue
          </h2>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Link href={`/issues/${latestIssue.slug}`} className="sm:w-56 sm:shrink-0">
              <SanityImage
                image={latestIssue.coverImage}
                width={448}
                sizes="(max-width: 640px) 100vw, 224px"
                className="h-auto w-full rounded"
              />
            </Link>
            <div>
              <h3 className="text-xl font-semibold tracking-tight">
                <Link
                  href={`/issues/${latestIssue.slug}`}
                  className="underline-offset-4 hover:underline"
                >
                  Issue {latestIssue.number} — {latestIssue.title}
                </Link>
              </h3>
              <p className="mt-2 text-sm text-black/55 dark:text-white/55">
                <time dateTime={latestIssue.publishedAt}>
                  {formatDate(latestIssue.publishedAt)}
                </time>
              </p>
              <p className="mt-4">
                <Link
                  href="/issues"
                  className="text-sm underline underline-offset-4 hover:no-underline"
                >
                  All issues
                </Link>
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
