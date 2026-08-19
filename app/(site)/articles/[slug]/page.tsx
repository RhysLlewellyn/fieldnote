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

import {ArticleIndex} from '@/app/components/ArticleIndex'
import {Byline} from '@/app/components/Byline'
import {PortableText, SimpleText} from '@/app/components/PortableText'
import {RisoArt} from '@/app/components/RisoArt'
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
    <article className="mx-auto max-w-[1100px] px-8 py-14">
      <header className="mx-auto max-w-[34rem]">
        {article.topics?.[0] ? (
          <p className="font-meta text-[0.7rem] tracking-[0.14em] text-ochre uppercase">
            {article.topics[0].title}
          </p>
        ) : null}

        <h1 className="font-display mt-3 text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.02] font-light tracking-[-0.028em] text-balance">
          {article.title}
        </h1>

        <p className="mt-5 text-[1.3rem] leading-[1.5] italic">{article.standfirst}</p>

        <Byline
          author={article.author}
          publishedAt={article.publishedAt}
          issue={article.issue}
          readingTime={article.readingTime}
        />
      </header>

      <figure className="my-10">
        <div className="aspect-[8/5] overflow-hidden">
          <RisoArt seed={article.slug} width={1000} height={625} />
        </div>
        <figcaption className="mx-auto mt-2.5 flex max-w-[34rem] flex-wrap justify-between gap-x-6 font-meta text-[0.7rem] tracking-[0.14em] text-muted uppercase">
          <span>{article.title}</span>
          <span>Riso — generated</span>
        </figcaption>
      </figure>

      <div className="mx-auto max-w-[34rem]">
        <PortableText value={article.body} />

        {article.topics?.length ? (
          <ul className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-rule pt-5 font-meta text-[0.7rem] tracking-[0.14em] text-muted uppercase">
            {article.topics.map((topic) => (
              <li key={topic._id}>
                <Link href={`/topics/${topic.slug}`} className="hover:text-ochre">
                  {topic.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {article.author ? (
          <aside className="mt-10 border-t border-rule pt-6">
            <p className="font-meta text-[0.7rem] tracking-[0.14em] text-muted uppercase">
              {article.author.role ?? 'Words'}
            </p>
            <p className="font-display mt-2 text-[1.35rem] tracking-[-0.015em]">
              <Link href={`/authors/${article.author.slug}`} className="hover:text-ochre">
                {article.author.name}
              </Link>
            </p>
            <div className="mt-2 max-w-[34rem] text-[1.02rem] leading-[1.6] text-ink-2">
              <SimpleText value={article.author.bio} />
            </div>
          </aside>
        ) : null}
      </div>

      {related.length ? (
        <section className="mt-20">
          <h2 className="mb-5 font-meta text-[0.7rem] tracking-[0.14em] text-muted uppercase">
            Related
          </h2>
          <ArticleIndex articles={related} />
        </section>
      ) : null}
    </article>
  )
}
