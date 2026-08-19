import {defineQuery} from 'next-sanity'

/**
 * Every GROQ query the site runs, in one file.
 *
 * They are wrapped in `defineQuery` so that `sanity typegen` can find them and
 * generate result types from the schema once the project has credentials —
 * at which point the hand-written types in ./types.ts can go.
 */

/**
 * An image, ready to hand to `urlForImage`.
 *
 * The spread carries the hotspot, crop, alt and credit; the expanded asset
 * carries the dimensions, which let a component reserve the right space before
 * the image loads, and the LQIP blur placeholder for what it looks like while
 * it does.
 */
const imageFields = /* groq */ `
  ...,
  asset->{
    _id,
    url,
    metadata {lqip, dimensions {width, height, aspectRatio}}
  }
`

/**
 * Portable Text, with the image assets inside it resolved.
 *
 * Without the two conditionals, a captioned image or a gallery arrives as a
 * bare reference and renders as a gap.
 */
const portableTextFields = /* groq */ `
  ...,
  _type == "captionedImage" => {${imageFields}},
  _type == "imageGallery" => {
    ...,
    images[]{${imageFields}}
  }
`

/** What a list needs to show an article: no body, no SEO. */
const articleCardFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  standfirst,
  publishedAt,
  featured,
  coverImage {${imageFields}},
  author->{name, "slug": slug.current},
  issue->{number, title, "slug": slug.current},
  topics[]->{_id, title, "slug": slug.current}
`

// -- Site chrome --------------------------------------------------------------

export const siteSettingsQuery = defineQuery(`
  *[_id == "siteSettings"][0]{
    title,
    description,
    defaultOgImage {${imageFields}},
    navigation[]{label, href},
    footerText,
    socialLinks[]{label, url}
  }
`)

// -- Homepage -----------------------------------------------------------------

/**
 * `recent` deliberately overlaps `featured` — GROQ cannot exclude the result of
 * a sibling projection, so it fetches one extra and the page drops the
 * duplicate. Cheaper than a second round trip.
 */
export const homeQuery = defineQuery(`{
  "featured": *[_type == "article" && featured == true]
    | order(publishedAt desc)[0]{${articleCardFields}},
  "recent": *[_type == "article"]
    | order(publishedAt desc)[0...13]{${articleCardFields}},
  "latestIssue": *[_type == "issue"] | order(number desc)[0]{
    _id,
    number,
    title,
    "slug": slug.current,
    publishedAt,
    coverImage {${imageFields}}
  }
}`)

// -- Articles -----------------------------------------------------------------

export const articleSlugsQuery = defineQuery(`
  *[_type == "article" && defined(slug.current)].slug.current
`)

export const articlesQuery = defineQuery(`
  *[_type == "article"] | order(publishedAt desc){${articleCardFields}}
`)

export const articleBySlugQuery = defineQuery(`
  *[_type == "article" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    standfirst,
    publishedAt,
    coverImage {${imageFields}},
    body[]{${portableTextFields}},
    author->{
      name,
      "slug": slug.current,
      role,
      portrait {${imageFields}},
      bio
    },
    issue->{number, title, "slug": slug.current},
    topics[]->{_id, title, "slug": slug.current},
    seo {..., ogImage {${imageFields}}}
  }
`)

/**
 * Articles sharing a topic with this one.
 *
 * The topic ids come from the article query rather than being resolved here,
 * because doing it in one query needs two levels of parent scope inside a
 * filter, which is the kind of GROQ nobody can read six months later.
 */
export const relatedArticlesQuery = defineQuery(`
  *[
    _type == "article"
    && slug.current != $slug
    && count(topics[_ref in $topicIds]) > 0
  ] | order(publishedAt desc)[0...3]{${articleCardFields}}
`)

// -- Issues -------------------------------------------------------------------

export const issueSlugsQuery = defineQuery(`
  *[_type == "issue" && defined(slug.current)].slug.current
`)

export const issuesQuery = defineQuery(`
  *[_type == "issue"] | order(number desc){
    _id,
    number,
    title,
    "slug": slug.current,
    publishedAt,
    coverImage {${imageFields}},
    "articleCount": count(*[_type == "article" && issue._ref == ^._id])
  }
`)

export const issueBySlugQuery = defineQuery(`
  *[_type == "issue" && slug.current == $slug][0]{
    _id,
    number,
    title,
    "slug": slug.current,
    publishedAt,
    colophon,
    coverImage {${imageFields}},
    introduction[]{${portableTextFields}},
    "articles": *[_type == "article" && issue._ref == ^._id]
      | order(publishedAt asc){${articleCardFields}}
  }
`)

// -- Topics -------------------------------------------------------------------

export const topicSlugsQuery = defineQuery(`
  *[_type == "topic" && defined(slug.current)].slug.current
`)

export const topicsQuery = defineQuery(`
  *[_type == "topic"] | order(title asc){
    _id,
    title,
    "slug": slug.current,
    description,
    "articleCount": count(*[_type == "article" && ^._id in topics[]._ref])
  }
`)

export const topicBySlugQuery = defineQuery(`
  *[_type == "topic" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    description,
    "articles": *[_type == "article" && ^._id in topics[]._ref]
      | order(publishedAt desc){${articleCardFields}}
  }
`)

// -- Authors ------------------------------------------------------------------

export const authorSlugsQuery = defineQuery(`
  *[_type == "author" && defined(slug.current)].slug.current
`)

export const authorBySlugQuery = defineQuery(`
  *[_type == "author" && slug.current == $slug][0]{
    _id,
    name,
    "slug": slug.current,
    role,
    portrait {${imageFields}},
    bio,
    links[]{label, url},
    "articles": *[_type == "article" && author._ref == ^._id]
      | order(publishedAt desc){${articleCardFields}}
  }
`)

// -- Pages --------------------------------------------------------------------

export const pageSlugsQuery = defineQuery(`
  *[_type == "page" && defined(slug.current)].slug.current
`)

export const pageBySlugQuery = defineQuery(`
  *[_type == "page" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    body[]{${portableTextFields}},
    seo {..., ogImage {${imageFields}}}
  }
`)
