import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {sanityFetch, sanityFetchPublished} from '@/sanity/lib/fetch'
import {topicBySlugQuery, topicSlugsQuery} from '@/sanity/lib/queries'
import type {Topic} from '@/sanity/lib/types'

import {ArticleIndex} from '@/app/components/ArticleIndex'
import {buildMetadata} from '@/app/lib/metadata'

type Props = {params: Promise<{slug: string}>}

function getTopic(slug: string) {
  return sanityFetch<Topic | null>({
    query: topicBySlugQuery,
    params: {slug},
    tags: ['topic', `topic:${slug}`, 'article', 'author'],
  })
}

export async function generateStaticParams() {
  const slugs = await sanityFetchPublished<string[]>({
    query: topicSlugsQuery,
    tags: ['topic'],
  })
  return slugs.map((slug) => ({slug}))
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const topic = await getTopic(slug)
  if (!topic) return {}

  return buildMetadata({title: topic.title, description: topic.description})
}

export default async function TopicPage({params}: Props) {
  const {slug} = await params
  const topic = await getTopic(slug)
  if (!topic) notFound()

  return (
    <div className="mx-auto max-w-[1100px] px-8 py-14">
      <header className="max-w-[34rem]">
        <p className="font-meta text-[0.7rem] tracking-[0.14em] text-ochre uppercase">
          Topic
        </p>
        <h1 className="font-display mt-3 text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.02] font-light tracking-[-0.028em]">
          {topic.title}
        </h1>
        {topic.description ? (
          <p className="mt-4 text-[1.3rem] leading-[1.5] italic">
            {topic.description}
          </p>
        ) : null}
      </header>

      <div className="mt-12">
        {topic.articles.length === 0 ? (
          <p className="text-muted">Nothing filed under this topic yet.</p>
        ) : (
          <ArticleIndex articles={topic.articles} />
        )}
      </div>
    </div>
  )
}
