import type {Metadata} from 'next'
import Link from 'next/link'

import {sanityFetch} from '@/sanity/lib/fetch'
import {issuesQuery} from '@/sanity/lib/queries'
import type {IssueCard} from '@/sanity/lib/types'

import {formatMonthYear} from '@/app/lib/format'

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
    <div className="mx-auto max-w-[1100px] px-8 py-14">
      <h1 className="font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.02] font-light tracking-[-0.028em]">
        Issues
      </h1>

      {issues.length === 0 ? (
        <p className="mt-8 text-muted">No issues published yet.</p>
      ) : (
        <ol className="mt-10 border-t border-rule">
          {issues.map((issue) => (
            <li key={issue._id} className="border-b border-rule">
              <Link
                href={`/issues/${issue.slug}`}
                className="group flex items-baseline gap-5 py-6 sm:gap-8"
              >
                <span className="font-meta text-[0.7rem] tracking-[0.14em] text-muted tabular-nums">
                  {String(issue.number).padStart(2, '0')}
                </span>

                <span className="flex-1">
                  <span className="font-display block text-[1.6rem] leading-[1.15] tracking-[-0.02em] group-hover:text-ochre">
                    {issue.title}
                  </span>
                  <span className="mt-1.5 block font-meta text-[0.7rem] tracking-[0.14em] text-muted uppercase">
                    <time dateTime={issue.publishedAt}>
                      {formatMonthYear(issue.publishedAt)}
                    </time>
                    {' · '}
                    {issue.articleCount}{' '}
                    {issue.articleCount === 1 ? 'piece' : 'pieces'}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
