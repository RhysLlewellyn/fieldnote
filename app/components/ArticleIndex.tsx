import Link from 'next/link'

import type {ArticleCard} from '@/sanity/lib/types'

/**
 * The list format for the whole site: number, title, a mono sub-line, and the
 * reading time pushed right, with a hairline between rows.
 *
 * There is no thumbnail. A grid of generated artwork at postage-stamp size
 * reads as decoration rather than information, and the index is the one place
 * a reader is scanning rather than looking.
 */
export function ArticleIndex({
  articles,
  startAt = 1,
}: {
  articles: ArticleCard[]
  /** Continue the numbering when a lead article has already taken 01. */
  startAt?: number
}) {
  return (
    <ol className="border-t border-rule">
      {articles.map((article, i) => (
        <li key={article._id} className="border-b border-rule">
          <Link
            href={`/articles/${article.slug}`}
            className="group flex items-baseline gap-5 py-5 sm:gap-8"
          >
            <span className="font-meta text-[0.7rem] tracking-[0.14em] text-muted tabular-nums">
              {String(i + startAt).padStart(2, '0')}
            </span>

            <span className="flex-1">
              <span className="font-display block text-[1.4rem] leading-[1.2] tracking-[-0.015em] text-balance group-hover:text-ochre">
                {article.title}
              </span>
              <span className="mt-1.5 block font-meta text-[0.7rem] tracking-[0.14em] text-muted uppercase">
                {[article.topics?.[0]?.title, article.author?.name]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </span>

            <span className="font-meta text-[0.7rem] tracking-[0.14em] text-muted whitespace-nowrap">
              {article.readingTime} min
            </span>
          </Link>
        </li>
      ))}
    </ol>
  )
}
