import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {sanityFetch, sanityFetchPublished} from '@/sanity/lib/fetch'
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
  const slugs = await sanityFetchPublished<string[]>({
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
    <div className="mx-auto max-w-[1100px] px-8 py-14">
      <div className="mx-auto max-w-[34rem]">
        <h1 className="font-display mb-10 text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.02] font-light tracking-[-0.028em] text-balance">
          {page.title}
        </h1>
        <PortableText value={page.body} />
      </div>
    </div>
  )
}
