import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {sanityFetch, sanityFetchPublished} from '@/sanity/lib/fetch'
import {issueBySlugQuery, issueSlugsQuery} from '@/sanity/lib/queries'
import type {Issue} from '@/sanity/lib/types'

import {ArticleIndex} from '@/app/components/ArticleIndex'
import {PortableText} from '@/app/components/PortableText'
import {RisoArt} from '@/app/components/RisoArt'
import {formatMonthYear} from '@/app/lib/format'
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

  return buildMetadata({title: `Issue ${issue.number} — ${issue.title}`})
}

export default async function IssuePage({params}: Props) {
  const {slug} = await params
  const issue = await getIssue(slug)
  if (!issue) notFound()

  return (
    <div className="mx-auto max-w-[1100px] px-8 py-14">
      <header className="grid gap-10 md:grid-cols-[1fr_1.1fr] md:gap-14">
        <div className="aspect-[4/5] overflow-hidden">
          <RisoArt seed={`issue-${issue.slug}`} width={640} height={800} />
        </div>

        <div className="self-center">
          <p className="font-meta text-[0.7rem] tracking-[0.14em] text-ochre uppercase">
            Issue {String(issue.number).padStart(2, '0')}
          </p>
          <h1 className="font-display mt-3 text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.02] font-light tracking-[-0.028em] text-balance">
            {issue.title}
          </h1>
          <p className="mt-3 font-meta text-[0.7rem] tracking-[0.14em] text-muted uppercase">
            <time dateTime={issue.publishedAt}>
              {formatMonthYear(issue.publishedAt)}
            </time>
          </p>

          <div className="mt-6 max-w-[34rem]">
            <PortableText value={issue.introduction} />
          </div>
        </div>
      </header>

      <section className="mt-20">
        <h2 className="mb-5 font-meta text-[0.7rem] tracking-[0.14em] text-muted uppercase">
          In this issue
        </h2>

        {issue.articles.length === 0 ? (
          <p className="text-muted">
            No articles have been filed under this issue yet.
          </p>
        ) : (
          <ArticleIndex articles={issue.articles} />
        )}
      </section>

      {issue.colophon ? (
        <section className="mt-20 border-t border-rule pt-6">
          <h2 className="font-meta text-[0.7rem] tracking-[0.14em] text-muted uppercase">
            Colophon
          </h2>
          <p className="mt-3 max-w-[34rem] text-[1.02rem] leading-[1.6] text-ink-2">
            {issue.colophon}
          </p>
        </section>
      ) : null}
    </div>
  )
}
