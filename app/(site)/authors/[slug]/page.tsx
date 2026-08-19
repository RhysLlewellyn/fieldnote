import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {sanityFetch, sanityFetchPublished} from '@/sanity/lib/fetch'
import {authorBySlugQuery, authorSlugsQuery} from '@/sanity/lib/queries'
import type {Author} from '@/sanity/lib/types'

import {ArticleCard} from '@/app/components/ArticleCard'
import {PortableText} from '@/app/components/PortableText'
import {SanityImage} from '@/app/components/SanityImage'
import {buildMetadata} from '@/app/lib/metadata'

type Props = {params: Promise<{slug: string}>}

function getAuthor(slug: string) {
  return sanityFetch<Author | null>({
    query: authorBySlugQuery,
    params: {slug},
    tags: ['author', `author:${slug}`, 'article'],
  })
}

export async function generateStaticParams() {
  const slugs = await sanityFetchPublished<string[]>({
    query: authorSlugsQuery,
    tags: ['author'],
  })
  return slugs.map((slug) => ({slug}))
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const author = await getAuthor(slug)
  if (!author) return {}

  return buildMetadata({title: author.name, image: author.portrait})
}

export default async function AuthorPage({params}: Props) {
  const {slug} = await params
  const author = await getAuthor(slug)
  if (!author) notFound()

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
      <header className="flex max-w-[45rem] flex-col gap-5 sm:flex-row sm:items-start">
        {author.portrait ? (
          <SanityImage
            image={author.portrait}
            width={192}
            aspect={1}
            sizes="96px"
            priority
            className="h-24 w-24 shrink-0 rounded-full"
          />
        ) : null}

        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {author.name}
          </h1>
          {author.role ? (
            <p className="mt-1 text-black/55 dark:text-white/55">{author.role}</p>
          ) : null}

          <div className="mt-3 text-black/70 dark:text-white/70">
            <PortableText value={author.bio} />
          </div>

          {author.links?.length ? (
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {author.links.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    className="underline underline-offset-4 hover:no-underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </header>

      <section className="mt-14 border-t border-black/10 pt-12 dark:border-white/15">
        <h2 className="mb-6 text-sm font-semibold tracking-wide uppercase text-black/55 dark:text-white/55">
          Articles by {author.name}
        </h2>

        {author.articles.length === 0 ? (
          <p className="text-black/60 dark:text-white/60">
            Nothing published yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {author.articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
