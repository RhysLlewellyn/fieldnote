import Link from 'next/link'

import {formatMonthYear} from '@/app/lib/format'

/**
 * The byline bar: author left, issue and reading time right, mono and
 * uppercase between two hairlines. It is the same object on every article, so
 * a reader learns where to look for it once.
 */
export function Byline({
  author,
  publishedAt,
  issue,
  readingTime,
}: {
  author: {name: string; slug: string} | null
  publishedAt: string
  issue: {number: number; slug: string} | null
  readingTime: number
}) {
  return (
    <div className="my-8 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-y border-rule py-3 font-meta text-[0.7rem] tracking-[0.14em] text-muted uppercase">
      <span>
        {author ? (
          <>
            Words —{' '}
            <Link href={`/authors/${author.slug}`} className="hover:text-ochre">
              {author.name}
            </Link>
          </>
        ) : (
          <time dateTime={publishedAt}>{formatMonthYear(publishedAt)}</time>
        )}
      </span>

      <span>
        {issue ? (
          <>
            <Link href={`/issues/${issue.slug}`} className="hover:text-ochre">
              Issue {String(issue.number).padStart(2, '0')}
            </Link>
            {' · '}
          </>
        ) : null}
        <time dateTime={publishedAt}>{formatMonthYear(publishedAt)}</time>
        {' · '}
        {readingTime} min
      </span>
    </div>
  )
}
