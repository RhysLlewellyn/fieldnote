import type {PortableTextBlock} from 'next-sanity'

/**
 * The shapes the queries in ./queries.ts return.
 *
 * Hand-written for now. Once the project has credentials, `sanity schema
 * extract` and `sanity typegen generate` derive these from the schema and the
 * `defineQuery` calls, and this file becomes generated rather than maintained.
 * Until then it is the only thing keeping the components honest, so it is
 * worth keeping in step with the queries.
 */

export type SanityImage = {
  _type: string
  alt?: string
  credit?: string
  hotspot?: {x: number; y: number; width: number; height: number}
  crop?: {top: number; bottom: number; left: number; right: number}
  asset: {
    _id: string
    url: string
    metadata?: {
      lqip?: string
      dimensions?: {width: number; height: number; aspectRatio: number}
    }
  }
}

// -- Portable Text ------------------------------------------------------------

export type LinkAnnotation = {
  _type: 'link'
  _key: string
  href: string
  openInNewTab?: boolean
}

export type PullQuoteBlock = {
  _type: 'pullQuote'
  _key: string
  quote: string
  attribution?: string
}

export type CaptionedImageBlock = SanityImage & {
  _type: 'captionedImage'
  _key: string
  alt: string
  caption?: string
}

export type ImageGalleryBlock = {
  _type: 'imageGallery'
  _key: string
  images: CaptionedImageBlock[]
  layout: 'grid' | 'sideBySide'
}

export type NoteAsideBlock = {
  _type: 'noteAside'
  _key: string
  title: string
  content: PortableTextBlock[]
  tone: 'note' | 'caution'
}

/** Anything that can appear in an article or page body. */
export type BodyBlock =
  | PortableTextBlock
  | PullQuoteBlock
  | CaptionedImageBlock
  | ImageGalleryBlock
  | NoteAsideBlock

// -- Documents ----------------------------------------------------------------

export type Seo = {
  title?: string
  description?: string
  ogImage?: SanityImage
}

export type TopicRef = {
  _id: string
  title: string
  slug: string
}

export type AuthorRef = {
  name: string
  slug: string
}

export type IssueRef = {
  number: number
  title: string
  slug: string
}

export type ArticleCard = {
  _id: string
  title: string
  slug: string
  standfirst: string
  publishedAt: string
  featured?: boolean
  /** Minutes, computed in GROQ from the body's plain text. */
  readingTime: number
  author: AuthorRef | null
  issue: IssueRef | null
  topics: TopicRef[] | null
}

export type Article = {
  _id: string
  title: string
  slug: string
  standfirst: string
  publishedAt: string
  body: BodyBlock[] | null
  author: {
    name: string
    slug: string
    role?: string
    bio?: PortableTextBlock[]
  } | null
  issue: IssueRef | null
  topics: TopicRef[] | null
  seo: Seo | null
}

export type IssueCard = {
  _id: string
  number: number
  title: string
  slug: string
  publishedAt: string
  articleCount: number
}

export type Issue = {
  _id: string
  number: number
  title: string
  slug: string
  publishedAt: string
  colophon?: string
  introduction: BodyBlock[] | null
  articles: ArticleCard[]
}

export type Topic = {
  _id: string
  title: string
  slug: string
  description?: string
  articles: ArticleCard[]
}

export type TopicWithCount = Omit<Topic, 'articles'> & {articleCount: number}

export type Author = {
  _id: string
  name: string
  slug: string
  role?: string
  bio?: PortableTextBlock[]
  links: {label: string; url: string}[] | null
  articles: ArticleCard[]
}

export type Page = {
  _id: string
  title: string
  slug: string
  body: BodyBlock[] | null
  seo: Seo | null
}

export type SiteSettings = {
  title: string
  description: string
  defaultOgImage?: SanityImage
  navigation: {label: string; href: string}[] | null
  footerText?: string
  socialLinks: {label: string; url: string}[] | null
}

export type HomePage = {
  featured: ArticleCard | null
  recent: ArticleCard[]
  latestIssue: Omit<IssueCard, 'articleCount'> | null
}

/**
 * Imagery is generated from a seed rather than uploaded, so no document type
 * carries a cover image any more. `SanityImage` survives for the two places
 * a real file is still the right answer: images an editor places inside an
 * article body, and the social share image, which has to be a raster URL a
 * third-party crawler can fetch.
 */
