import type {Metadata} from 'next'
import Link from 'next/link'
import {notFound} from 'next/navigation'

import {sanityFetch, sanityFetchPublished} from '@/sanity/lib/fetch'
import {
  articleBySlugQuery,
  articleSlugsQuery,
  relatedArticlesQuery,
} from '@/sanity/lib/queries'
import type {Article, ArticleCard as ArticleCardValue} from '@/sanity/lib/types'

import {ArticleCard} from '@/app/components/ArticleCard'
import {PortableText} from '@/app/components/PortableText'
import {SanityImage} from '@/app/components/SanityImage'
import {formatDate} from '@/app/lib/format'
import {buildMetadata} from '@/app/lib/metadata'

type Props = {params: Promise<{slug: string}>}

const tagsFor = (slug: string) => [
  'article',
  `article:${slug}`,
  // The byline, the topic names and the issue number are all rendered from
  // referenced documents, so editing any of them has to invalidate this page.
  'author',
  'topic',
  'issue',
]

function getArticle(slug: string) {
  return sanityFetch<Article | null>({
    query: articleBySlugQuery,
    params: {slug},
    tags: tagsFor(slug),
  })
}

export async function generateStaticParams() {
  const slugs = await sanityFetchPublished<string[]>({
    query: articleSlugsQuery,
    tags: ['article'],
  })
  return slugs.map((slug) => ({slug}))
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const article = await getArticle(slug)
  if (!article) return {}

  return buildMetadata({
    title: article.title,
    description: article.standfirst,
    image: article.coverImage,
    seo: article.seo,
  })
}

export default async function ArticlePage({params}: Props) {
  const {slug} = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const topicIds = article.topics?.map((topic) => topic._id) ?? []
  const related = topicIds.length
    ? await sanityFetch<ArticleCardValue[]>({
        query: relatedArticlesQuery,
        params: {slug, topicIds},
        tags: ['article', 'topic'],
      })
    : []

  return (
    <article className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
      <header className="mx-auto max-w-[45rem]">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {article.title}
        </h1>

        <p className="mt-4 text-lg text-black/70 dark:text-white/70">
          {article.standfirst}
        </p>

        <p className="mt-5 text-sm text-black/55 dark:text-white/55">
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
      </header>

      <figure className="my-8 sm:my-10">
        <SanityImage
          image={article.coverImage}
          width={1200}
          aspect={3 / 2}
          sizes="(max-width: 1024px) 100vw, 1024px"
          priority
          className="h-auto w-full rounded"
        />
        {article.coverImage.credit ? (
          <figcaption className="mt-2 text-sm text-black/60 dark:text-white/60">
            {article.coverImage.credit}
          </figcaption>
        ) : null}
      </figure>

      <div className="mx-auto max-w-[45rem]">
        <PortableText value={article.body} />

        {article.topics?.length ? (
          <ul className="mt-10 flex flex-wrap gap-2">
            {article.topics.map((topic) => (
              <li key={topic._id}>
                <Link
                  href={`/topics/${topic.slug}`}
                  className="rounded-full border border-black/15 px-3 py-1 text-sm hover:border-black/40 dark:border-white/20 dark:hover:border-white/50"
                >
                  {topic.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {article.author ? (
          <aside className="mt-12 flex gap-4 border-t border-black/10 pt-8 dark:border-white/15">
            {article.author.portrait ? (
              <SanityImage
                image={article.author.portrait}
                width={128}
                aspect={1}
                sizes="64px"
                className="h-16 w-16 shrink-0 rounded-full"
              />
            ) : null}
            <div>
              <p className="font-semibold">
                <Link
                  href={`/authors/${article.author.slug}`}
                  className="underline-offset-4 hover:underline"
                >
                  {article.author.name}
                </Link>
                {article.author.role ? (
                  <span className="font-normal text-black/55 dark:text-white/55">
                    {' · '}
                    {article.author.role}
                  </span>
                ) : null}
              </p>
              <div className="mt-1 text-sm text-black/70 dark:text-white/70">
                <PortableText value={article.author.bio} />
              </div>
            </div>
          </aside>
        ) : null}
      </div>

      {related.length ? (
        <section className="mt-16 border-t border-black/10 pt-12 dark:border-white/15">
          <h2 className="mb-6 text-sm font-semibold tracking-wide uppercase text-black/55 dark:text-white/55">
            Related
          </h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-3">
            {related.map((item) => (
              <ArticleCard key={item._id} article={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  )
}
