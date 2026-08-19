import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {sanityFetch, sanityFetchPublished} from '@/sanity/lib/fetch'
import {authorBySlugQuery, authorSlugsQuery} from '@/sanity/lib/queries'
import type {Author} from '@/sanity/lib/types'

import {ArticleIndex} from '@/app/components/ArticleIndex'
import {SimpleText} from '@/app/components/PortableText'
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

  return buildMetadata({title: author.name})
}

/**
 * Typographic rather than illustrated. A contributor page is a name, what they
 * do, and what they have written — a portrait would be the one photograph on a
 * site that has none.
 */
export default async function AuthorPage({params}: Props) {
  const {slug} = await params
  const author = await getAuthor(slug)
  if (!author) notFound()

  return (
    <div className="mx-auto max-w-[1100px] px-8 py-14">
      <header className="max-w-[34rem]">
        {author.role ? (
          <p className="font-meta text-[0.7rem] tracking-[0.14em] text-ochre uppercase">
            {author.role}
          </p>
        ) : null}

        <h1 className="font-display mt-3 text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.02] font-light tracking-[-0.028em]">
          {author.name}
        </h1>

        <div className="mt-5 text-[1.125rem] leading-[1.7]">
          <SimpleText value={author.bio} />
        </div>

        {author.links?.length ? (
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-meta text-[0.7rem] tracking-[0.14em] text-muted uppercase">
            {author.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  className="hover:text-ochre"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <section className="mt-14">
        <h2 className="mb-5 font-meta text-[0.7rem] tracking-[0.14em] text-muted uppercase">
          Words by {author.name}
        </h2>

        {author.articles.length === 0 ? (
          <p className="text-muted">Nothing published yet.</p>
        ) : (
          <ArticleIndex articles={author.articles} />
        )}
      </section>
    </div>
  )
}
