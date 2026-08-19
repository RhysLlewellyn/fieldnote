import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {sanityFetch} from '@/sanity/lib/fetch'
import {topicBySlugQuery, topicSlugsQuery} from '@/sanity/lib/queries'
import type {Topic} from '@/sanity/lib/types'

import {ArticleCard} from '@/app/components/ArticleCard'
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
  const slugs = await sanityFetch<string[]>({
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
    <div className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
      <header className="max-w-[45rem]">
        <p className="text-sm tracking-wide uppercase text-black/55 dark:text-white/55">
          Topic
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          {topic.title}
        </h1>
        {topic.description ? (
          <p className="mt-3 text-lg text-black/70 dark:text-white/70">
            {topic.description}
          </p>
        ) : null}
      </header>

      {topic.articles.length === 0 ? (
        <p className="mt-10 text-black/60 dark:text-white/60">
          Nothing filed under this topic yet.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {topic.articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
