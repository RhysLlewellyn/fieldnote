import type {
  ArticleBySlugQueryResult,
  ArticlesQueryResult,
  AuthorBySlugQueryResult,
  HomeQueryResult,
  IssueBySlugQueryResult,
  IssuesQueryResult,
  PageBySlugQueryResult,
  SiteSettingsQueryResult,
  TopicBySlugQueryResult,
  TopicsQueryResult,
} from './generated'

/**
 * The names the app uses for what the queries return.
 *
 * Nothing is described by hand here. Every type below is derived from
 * `./generated.ts`, which `sanity typegen` writes from the schema and the
 * `defineQuery` calls in `./queries.ts`:
 *
 *   npx sanity schema extract --path sanity/extract.json --force \
 *     --enforce-required-fields
 *   npx sanity typegen generate
 *
 * Run both after changing a schema or a query. A hand-maintained copy of these
 * shapes drifts from the queries silently, and the first symptom is a page
 * rendering "undefined" in production.
 *
 * The aliases exist because generated names describe the query that produced
 * them rather than the thing they are, and a component should ask for an
 * `Article`, not an `ArticleBySlugQueryResult`.
 */

// -- Documents ----------------------------------------------------------------

export type SiteSettings = NonNullable<SiteSettingsQueryResult>
export type HomePage = HomeQueryResult

/** An article as a list shows it: no body, no SEO. */
export type ArticleCard = ArticlesQueryResult[number]
export type Article = NonNullable<ArticleBySlugQueryResult>

export type IssueCard = IssuesQueryResult[number]
export type Issue = NonNullable<IssueBySlugQueryResult>

export type TopicWithCount = TopicsQueryResult[number]
export type Topic = NonNullable<TopicBySlugQueryResult>

export type Author = NonNullable<AuthorBySlugQueryResult>
export type Page = NonNullable<PageBySlugQueryResult>

export type Seo = NonNullable<Article['seo']>

// -- Portable Text ------------------------------------------------------------

/** Anything that can appear in an article or page body. */
export type BodyBlock = NonNullable<Article['body']>[number]

type BlockOfType<T extends BodyBlock['_type']> = Extract<BodyBlock, {_type: T}>

export type PullQuoteBlock = BlockOfType<'pullQuote'>
export type CaptionedImageBlock = BlockOfType<'captionedImage'>
export type ImageGalleryBlock = BlockOfType<'imageGallery'>
export type NoteAsideBlock = BlockOfType<'noteAside'>

/**
 * The link annotation, as it appears in `markDefs`.
 *
 * Portable Text types annotations as a union keyed by `_type`, and the
 * renderer receives one member of it without narrowing, so this pulls out the
 * one shape the link component cares about.
 */
export type LinkAnnotation = {
  _type: 'link'
  _key: string
  href: string
  openInNewTab?: boolean
}

/**
 * An image with its asset resolved.
 *
 * Imagery is generated from a seed rather than uploaded, so no document type
 * carries a cover image any more. This survives for the two places a real file
 * is still the right answer: images an editor places inside an article body,
 * and the social share image, which has to be a raster URL a third-party
 * crawler can fetch.
 */
export type SanityImage = CaptionedImageBlock
