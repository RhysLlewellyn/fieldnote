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

/** The measure, and so the width images are requested at. */
const COLUMN_WIDTH = 720

/**
 * Figures and pull quotes are the only things allowed past the 34rem measure.
 * They pull out symmetrically once there is room, and sit inside it on a
 * phone, where there is nothing to break out of.
 */
const BREAKOUT = 'md:-mx-24 md:w-[calc(100%+12rem)]'

const linkClass = 'text-ochre underline decoration-rule underline-offset-4 hover:decoration-ochre'

function Caption({caption, credit}: {caption?: string; credit?: string}) {
  if (!caption && !credit) return null

  return (
    <figcaption className="mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-1 font-meta text-[0.7rem] leading-relaxed tracking-[0.14em] text-muted uppercase">
      <span>{caption}</span>
      {credit ? <span>{credit}</span> : null}
    </figcaption>
  )
}

function Figure({
  value,
  width,
  sizes,
  className,
}: {
  value: CaptionedImageBlock
  width: number
  sizes: string
  className?: string
}) {
  return (
    <figure className={className}>
      <SanityImage image={value} width={width} sizes={sizes} className="h-auto w-full" />
      <Caption caption={value.caption} credit={value.credit} />
    </figure>
  )
}

/** Paragraphs and links only — what an aside's own content is allowed to be. */
const asideComponents: PortableTextComponents = {
  block: {
    normal: ({children}) => <p className="mt-2 first:mt-0">{children}</p>,
  },
  marks: {
    link: ({value, children}) => {
      const {href} = (value ?? {}) as LinkAnnotation
      if (!href) return <>{children}</>
      return (
        <a href={href} className={linkClass}>
          {children}
        </a>
      )
    },
  },
}

const components: PortableTextComponents<BodyBlock> = {
  block: {
    /**
     * The drop cap is on the first paragraph of an article and nowhere else.
     * `index` is the position in the body array, so a piece opening with a
     * heading correctly gets none.
     */
    normal: ({children, index}) =>
      index === 0 ? (
        <p className="mt-0 [&::first-letter]:font-display [&::first-letter]:float-left [&::first-letter]:mt-1.5 [&::first-letter]:mr-2.5 [&::first-letter]:text-[4.2rem] [&::first-letter]:leading-[0.78] [&::first-letter]:font-light [&::first-letter]:text-ochre">
          {children}
        </p>
      ) : (
        <p className="mt-6">{children}</p>
      ),

    h2: ({children}) => (
      <h2 className="font-display mt-14 mb-5 text-[2.5rem] leading-[1.08] font-normal tracking-[-0.02em] text-balance">
        {children}
      </h2>
    ),

    h3: ({children}) => (
      <h3 className="font-display mt-10 mb-3 text-[1.5rem] leading-[1.2] font-medium">
        {children}
      </h3>
    ),

    blockquote: ({children}) => (
      <blockquote className="my-8 border-l-2 border-rule pl-6 italic">
        {children}
      </blockquote>
    ),
  },

  list: {
    bullet: ({children}) => <ul className="mt-6 list-disc space-y-2 pl-6">{children}</ul>,
    number: ({children}) => <ol className="mt-6 list-decimal space-y-2 pl-6">{children}</ol>,
  },

  listItem: {
    bullet: ({children}) => <li className="pl-1">{children}</li>,
    number: ({children}) => <li className="pl-1">{children}</li>,
  },

  marks: {
    strong: ({children}) => <strong className="font-semibold">{children}</strong>,
    em: ({children}) => <em className="italic">{children}</em>,
    code: ({children}) => (
      <code className="bg-paper-2 px-1 py-0.5 font-meta text-[0.85em]">{children}</code>
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

      if (href.startsWith('/')) {
        return (
          <Link href={href} className={linkClass}>
            {children}
          </Link>
        )
      }

      return (
        <a
          href={href}
          className={linkClass}
          {...(openInNewTab ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
        >
          {children}
        </a>
      )
    },
  },

  types: {
    pullQuote: ({value}: {value: PullQuoteBlock}) => (
      <figure className={`my-12 border-y-2 border-ink py-7 ${BREAKOUT}`}>
        <blockquote className="font-display text-[1.9rem] leading-[1.18] font-light tracking-[-0.02em] text-balance">
          {value.quote}
        </blockquote>
        {value.attribution ? (
          <figcaption className="mt-3 font-meta text-[0.7rem] tracking-[0.14em] text-muted uppercase">
            {value.attribution}
          </figcaption>
        ) : null}
      </figure>
    ),

    captionedImage: ({value}: {value: CaptionedImageBlock}) => (
      <Figure
        value={value}
        width={COLUMN_WIDTH}
        sizes={`(max-width: ${COLUMN_WIDTH}px) 100vw, ${COLUMN_WIDTH}px`}
        className={`my-10 ${BREAKOUT}`}
      />
    ),

    /**
     * Both layouts are one column on a phone. Side by side at 380px wide is
     * two images nobody can see rather than a comparison.
     */
    imageGallery: ({value}: {value: ImageGalleryBlock}) => (
      <div className={`my-10 grid grid-cols-1 gap-5 sm:grid-cols-2 ${BREAKOUT}`}>
        {value.images.map((image) => (
          <Figure
            key={image._key}
            value={image}
            width={Math.round(COLUMN_WIDTH / 2)}
            sizes="(max-width: 640px) 100vw, 360px"
          />
        ))}
      </div>
    ),

    /**
     * Moss, not ochre: asides are structural, and the two accents never share
     * a view.
     */
    noteAside: ({value}: {value: NoteAsideBlock}) => (
      <aside
        className={`my-10 border-l-[3px] py-1 pl-6 ${
          value.tone === 'caution' ? 'border-ochre' : 'border-moss'
        }`}
      >
        <p className="mb-2 font-meta text-[0.7rem] tracking-[0.14em] text-muted uppercase">
          {value.title}
        </p>
        <div className="text-[1.02rem] leading-[1.6]">
          <PortableTextRenderer value={value.content} components={asideComponents} />
        </div>
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

  return <PortableTextRenderer value={value} components={components} />
}

/** Bios and introductions: prose without the article-only flourishes. */
export function SimpleText({value}: {value: BodyBlock[] | null | undefined}) {
  if (!value?.length) return null

  return <PortableTextRenderer value={value} components={asideComponents} />
}
