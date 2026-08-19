import Link from 'next/link'

import {formatDate} from '@/app/lib/format'
import type {ArticleCard as ArticleCardValue} from '@/sanity/lib/types'

import {SanityImage} from './SanityImage'

/**
 * One article in a list.
 *
 * `lead` is the large slot at the top of the homepage. It is the same markup
 * at a different size rather than a separate component, so a change to how an
 * article is summarised only has to be made once.
 */
export function ArticleCard({
  article,
  lead = false,
  priority = false,
}: {
  article: ArticleCardValue
  lead?: boolean
  priority?: boolean
}) {
  return (
    <article className={lead ? 'sm:grid sm:grid-cols-2 sm:gap-8' : ''}>
      <Link href={`/articles/${article.slug}`} className="group block">
        <SanityImage
          image={article.coverImage}
          width={lead ? 1200 : 600}
          aspect={lead ? 3 / 2 : 4 / 3}
          sizes={
            lead
              ? '(max-width: 640px) 100vw, 50vw'
              : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
          }
          priority={priority}
          className="h-auto w-full rounded"
        />
      </Link>

      <div className={lead ? 'mt-4 sm:mt-0' : 'mt-3'}>
        <h2
          className={
            lead
              ? 'text-2xl font-semibold tracking-tight text-balance sm:text-3xl'
              : 'text-lg font-semibold tracking-tight text-balance'
          }
        >
          <Link
            href={`/articles/${article.slug}`}
            className="underline-offset-4 hover:underline"
          >
            {article.title}
          </Link>
        </h2>

        <p
          className={
            lead
              ? 'mt-3 text-base text-black/70 sm:text-lg dark:text-white/70'
              : 'mt-2 text-sm text-black/70 dark:text-white/70'
          }
        >
          {article.standfirst}
        </p>

        <p className="mt-3 text-sm text-black/55 dark:text-white/55">
          {article.author ? (
            <>
              <Link
                href={`/authors/${article.author.slug}`}
                className="underline-offset-4 hover:underline"
              >
                {article.author.name}
              </Link>
              {' · '}
            </>
          ) : null}
          <time dateTime={article.publishedAt}>
            {formatDate(article.publishedAt)}
          </time>
          {article.issue ? (
            <>
              {' · '}
              <Link
                href={`/issues/${article.issue.slug}`}
                className="underline-offset-4 hover:underline"
              >
                Issue {article.issue.number}
              </Link>
            </>
          ) : null}
        </p>
      </div>
    </article>
  )
}
