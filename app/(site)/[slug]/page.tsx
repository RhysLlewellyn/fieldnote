import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {sanityFetch} from '@/sanity/lib/fetch'
import {pageBySlugQuery, pageSlugsQuery} from '@/sanity/lib/queries'
import type {Page} from '@/sanity/lib/types'

import {PortableText} from '@/app/components/PortableText'
import {buildMetadata} from '@/app/lib/metadata'

/**
 * Editor-made pages, at the top level: /about, /contact.
 *
 * This sits at the root so the addresses stay short, which means it also
 * catches anything that is not a real route. Next matches static segments
 * before dynamic ones, so /issues and /topics are safe; anything genuinely
 * unknown falls through to notFound() below.
 */
type Props = {params: Promise<{slug: string}>}

function getPage(slug: string) {
  return sanityFetch<Page | null>({
    query: pageBySlugQuery,
    params: {slug},
    tags: ['page', `page:${slug}`],
  })
}

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>({
    query: pageSlugsQuery,
    tags: ['page'],
  })
  return slugs.map((slug) => ({slug}))
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const page = await getPage(slug)
  if (!page) return {}

  return buildMetadata({title: page.title, seo: page.seo})
}

export default async function ContentPage({params}: Props) {
  const {slug} = await params
  const page = await getPage(slug)
  if (!page) notFound()

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
      <div className="mx-auto max-w-[45rem]">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {page.title}
        </h1>
        <PortableText value={page.body} />
      </div>
    </div>
  )
}
