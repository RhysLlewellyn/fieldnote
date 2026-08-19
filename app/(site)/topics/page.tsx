import type {Metadata} from 'next'
import Link from 'next/link'

import {sanityFetch} from '@/sanity/lib/fetch'
import {topicsQuery} from '@/sanity/lib/queries'
import type {TopicWithCount} from '@/sanity/lib/types'

export const metadata: Metadata = {
  title: 'Topics',
  description: 'Every topic Fieldnote files work under.',
}

export default async function TopicsPage() {
  const topics = await sanityFetch<TopicWithCount[]>({
    query: topicsQuery,
    tags: ['topic', 'article'],
  })

  return (
    <div className="mx-auto max-w-[1100px] px-8 py-14">
      <h1 className="font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.02] font-light tracking-[-0.028em]">
        Topics
      </h1>

      {topics.length === 0 ? (
        <p className="mt-8 text-muted">No topics yet.</p>
      ) : (
        <ol className="mt-10 border-t border-rule">
          {topics.map((topic, i) => (
            <li key={topic._id} className="border-b border-rule">
              <Link
                href={`/topics/${topic.slug}`}
                className="group flex items-baseline gap-5 py-6 sm:gap-8"
              >
                <span className="font-meta text-[0.7rem] tracking-[0.14em] text-muted tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <span className="flex-1">
                  <span className="font-display block text-[1.6rem] leading-[1.15] tracking-[-0.02em] group-hover:text-ochre">
                    {topic.title}
                  </span>
                  {topic.description ? (
                    <span className="mt-1.5 block max-w-[34rem] text-[1.02rem] leading-[1.6] text-ink-2">
                      {topic.description}
                    </span>
                  ) : null}
                </span>

                <span className="font-meta text-[0.7rem] tracking-[0.14em] text-muted whitespace-nowrap">
                  {topic.articleCount}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
