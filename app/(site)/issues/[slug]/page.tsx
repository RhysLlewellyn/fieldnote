import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {sanityFetch, sanityFetchPublished} from '@/sanity/lib/fetch'
import {issueBySlugQuery, issueSlugsQuery} from '@/sanity/lib/queries'
import type {Issue} from '@/sanity/lib/types'

import {ArticleCard} from '@/app/components/ArticleCard'
import {PortableText} from '@/app/components/PortableText'
import {SanityImage} from '@/app/components/SanityImage'
import {formatDate} from '@/app/lib/format'
import {buildMetadata} from '@/app/lib/metadata'

type Props = {params: Promise<{slug: string}>}

function getIssue(slug: string) {
  return sanityFetch<Issue | null>({
    query: issueBySlugQuery,
    params: {slug},
    tags: ['issue', `issue:${slug}`, 'article', 'author'],
  })
}

export async function generateStaticParams() {
  const slugs = await sanityFetchPublished<string[]>({
    query: issueSlugsQuery,
    tags: ['issue'],
  })
  return slugs.map((slug) => ({slug}))
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const issue = await getIssue(slug)
  if (!issue) return {}

  return buildMetadata({
    title: `Issue ${issue.number} — ${issue.title}`,
    image: issue.coverImage,
  })
}

export default async function IssuePage({params}: Props) {
  const {slug} = await params
  const issue = await getIssue(slug)
  if (!issue) notFound()

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
      <header className="flex flex-col gap-8 sm:flex-row sm:items-start">
        <div className="sm:w-64 sm:shrink-0">
          <SanityImage
            image={issue.coverImage}
            width={512}
            sizes="(max-width: 640px) 100vw, 256px"
            priority
            className="h-auto w-full rounded"
          />
        </div>

        <div>
          <p className="text-sm tracking-wide uppercase text-black/55 dark:text-white/55">
            Issue {issue.number}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {issue.title}
          </h1>
          <p className="mt-2 text-sm text-black/55 dark:text-white/55">
            <time dateTime={issue.publishedAt}>
              {formatDate(issue.publishedAt)}
            </time>
          </p>

          <div className="mt-4 max-w-[45rem]">
            <PortableText value={issue.introduction} />
          </div>
        </div>
      </header>

      <section className="mt-14 border-t border-black/10 pt-12 dark:border-white/15">
        <h2 className="mb-6 text-sm font-semibold tracking-wide uppercase text-black/55 dark:text-white/55">
          In this issue
        </h2>

        {issue.articles.length === 0 ? (
          <p className="text-black/60 dark:text-white/60">
            No articles have been filed under this issue yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {issue.articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        )}
      </section>

      {issue.colophon ? (
        <section className="mt-14 border-t border-black/10 pt-8 dark:border-white/15">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-black/55 dark:text-white/55">
            Colophon
          </h2>
          <p className="mt-3 max-w-[45rem] text-sm text-black/70 dark:text-white/70">
            {issue.colophon}
          </p>
        </section>
      ) : null}
    </div>
  )
}
