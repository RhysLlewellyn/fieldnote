import Link from 'next/link'
import {
  PortableText as PortableTextRenderer,
  type PortableTextComponents,
} from 'next-sanity'

import type {
  BodyBlock,
  CaptionedImageBlock,
  ImageGalleryBlock,
  LinkAnnotation,
  NoteAsideBlock,
  PullQuoteBlock,
} from '@/sanity/lib/types'

import {SanityImage} from './SanityImage'

/** The measure a body column is drawn at, and so the width images are asked for. */
const COLUMN_WIDTH = 720

function Figure({
  value,
  width,
  sizes,
}: {
  value: CaptionedImageBlock
  width: number
  sizes: string
}) {
  const {caption, credit} = value

  return (
    <figure className="my-8">
      <SanityImage
        image={value}
        width={width}
        sizes={sizes}
        className="h-auto w-full rounded"
      />
      {(caption || credit) && (
        <figcaption className="mt-2 text-sm text-black/60 dark:text-white/60">
          {caption}
          {caption && credit && ' '}
          {credit && <span className="italic">{credit}</span>}
        </figcaption>
      )}
    </figure>
  )
}

const components: PortableTextComponents<BodyBlock> = {
  block: {
    normal: ({children}) => <p className="my-5 leading-relaxed">{children}</p>,
    h2: ({children}) => (
      <h2 className="mt-12 mb-4 text-2xl font-semibold tracking-tight">
        {children}
      </h2>
    ),
    h3: ({children}) => (
      <h3 className="mt-8 mb-3 text-xl font-semibold tracking-tight">
        {children}
      </h3>
    ),
    blockquote: ({children}) => (
      <blockquote className="my-8 border-l-2 border-black/20 pl-6 italic dark:border-white/20">
        {children}
      </blockquote>
    ),
  },

  list: {
    bullet: ({children}) => (
      <ul className="my-5 list-disc space-y-2 pl-6">{children}</ul>
    ),
    number: ({children}) => (
      <ol className="my-5 list-decimal space-y-2 pl-6">{children}</ol>
    ),
  },

  listItem: {
    bullet: ({children}) => <li className="leading-relaxed">{children}</li>,
    number: ({children}) => <li className="leading-relaxed">{children}</li>,
  },

  marks: {
    strong: ({children}) => <strong className="font-semibold">{children}</strong>,
    em: ({children}) => <em className="italic">{children}</em>,
    code: ({children}) => (
      <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-[0.9em] dark:bg-white/10">
        {children}
      </code>
    ),
    /**
     * Internal links go through next/link so navigation stays client-side;
     * anything else is a plain anchor. `noopener` is not optional on a target
     * of _blank — without it the opened page can reach back through
     * window.opener.
     */
    link: ({value, children}) => {
      const {href, openInNewTab} = (value ?? {}) as LinkAnnotation
      if (!href) return <>{children}</>

      const className = 'underline underline-offset-2 hover:no-underline'

      if (href.startsWith('/')) {
        return (
          <Link href={href} className={className}>
            {children}
          </Link>
        )
      }

      return (
        <a
          href={href}
          className={className}
          {...(openInNewTab
            ? {target: '_blank', rel: 'noopener noreferrer'}
            : {})}
        >
          {children}
        </a>
      )
    },
  },

  types: {
    pullQuote: ({value}: {value: PullQuoteBlock}) => (
      <figure className="my-10 border-y border-black/10 py-6 dark:border-white/15">
        <blockquote className="text-xl leading-snug font-medium text-balance">
          &ldquo;{value.quote}&rdquo;
        </blockquote>
        {value.attribution && (
          <figcaption className="mt-3 text-sm text-black/60 dark:text-white/60">
            &mdash; {value.attribution}
          </figcaption>
        )}
      </figure>
    ),

    captionedImage: ({value}: {value: CaptionedImageBlock}) => (
      <Figure
        value={value}
        width={COLUMN_WIDTH}
        sizes={`(max-width: ${COLUMN_WIDTH}px) 100vw, ${COLUMN_WIDTH}px`}
      />
    ),

    /**
     * Both layouts are one column on a phone. Side by side at 380px wide is
     * two images nobody can see rather than a comparison.
     */
    imageGallery: ({value}: {value: ImageGalleryBlock}) => {
      const sideBySide = value.layout === 'sideBySide'
      const width = Math.round(COLUMN_WIDTH / 2)

      return (
        <div
          className={
            sideBySide
              ? 'my-8 grid grid-cols-1 gap-4 sm:grid-cols-2'
              : 'my-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
          }
        >
          {value.images.map((image) => (
            <Figure
              key={image._key}
              value={image}
              width={width}
              sizes={`(max-width: 640px) 100vw, ${width}px`}
            />
          ))}
        </div>
      )
    },

    noteAside: ({value}: {value: NoteAsideBlock}) => (
      <aside
        className={
          value.tone === 'caution'
            ? 'my-8 rounded border-l-4 border-amber-500 bg-amber-500/5 p-5'
            : 'my-8 rounded border-l-4 border-black/20 bg-black/[0.03] p-5 dark:border-white/25 dark:bg-white/5'
        }
      >
        <p className="mb-2 text-sm font-semibold tracking-wide uppercase">
          {value.title}
        </p>
        {/* The aside's own content is paragraphs and links only, so it renders
            with the default components rather than recursing through these. */}
        <PortableTextRenderer value={value.content} />
      </aside>
    ),
  },
}

/**
 * An article or page body.
 *
 * Returns null rather than an empty wrapper when there is no body, so a page
 * with no content does not leave a mysterious gap in the layout.
 */
export function PortableText({value}: {value: BodyBlock[] | null | undefined}) {
  if (!value?.length) return null

  return (
    <div className="text-base sm:text-lg">
      <PortableTextRenderer value={value} components={components} />
    </div>
  )
}
