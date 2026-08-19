import type {Metadata} from 'next'
import Link from 'next/link'

import {sanityFetch} from '@/sanity/lib/fetch'
import {issuesQuery} from '@/sanity/lib/queries'
import type {IssueCard} from '@/sanity/lib/types'

import {SanityImage} from '@/app/components/SanityImage'
import {formatDate} from '@/app/lib/format'

export const metadata: Metadata = {
  title: 'Issues',
  description: 'Every issue of Fieldnote, newest first.',
}

export default async function IssuesPage() {
  const issues = await sanityFetch<IssueCard[]>({
    query: issuesQuery,
    // The article count is part of this query, so a new article changes it.
    tags: ['issue', 'article'],
  })

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Issues</h1>

      {issues.length === 0 ? (
        <p className="mt-8 text-black/60 dark:text-white/60">
          No issues published yet.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {issues.map((issue) => (
            <article key={issue._id}>
              <Link href={`/issues/${issue.slug}`} className="block">
                <SanityImage
                  image={issue.coverImage}
                  width={480}
                  sizes="(max-width: 640px) 50vw, 240px"
                  className="h-auto w-full rounded"
                />
              </Link>
              <h2 className="mt-3 font-semibold tracking-tight">
                <Link
                  href={`/issues/${issue.slug}`}
                  className="underline-offset-4 hover:underline"
                >
                  Issue {issue.number} — {issue.title}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-black/55 dark:text-white/55">
                <time dateTime={issue.publishedAt}>
                  {formatDate(issue.publishedAt)}
                </time>
                {' · '}
                {issue.articleCount}{' '}
                {issue.articleCount === 1 ? 'article' : 'articles'}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
