import type {Metadata} from 'next'
import Link from 'next/link'

import {sanityFetch} from '@/sanity/lib/fetch'
import {topicsQuery} from '@/sanity/lib/queries'
import type {TopicWithCount} from '@/sanity/lib/types'

export const metadata: Metadata = {
  title: 'Topics',
  description: 'Every topic Fieldnote files articles under.',
}

export default async function TopicsPage() {
  const topics = await sanityFetch<TopicWithCount[]>({
    query: topicsQuery,
    tags: ['topic', 'article'],
  })

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Topics</h1>

      {topics.length === 0 ? (
        <p className="mt-8 text-black/60 dark:text-white/60">No topics yet.</p>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
          {topics.map((topic) => (
            <li key={topic._id} className="border-t border-black/10 pt-4 dark:border-white/15">
              <h2 className="text-lg font-semibold tracking-tight">
                <Link
                  href={`/topics/${topic.slug}`}
                  className="underline-offset-4 hover:underline"
                >
                  {topic.title}
                </Link>
              </h2>
              {topic.description ? (
                <p className="mt-1 text-sm text-black/70 dark:text-white/70">
                  {topic.description}
                </p>
              ) : null}
              <p className="mt-1 text-sm text-black/55 dark:text-white/55">
                {topic.articleCount}{' '}
                {topic.articleCount === 1 ? 'article' : 'articles'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
