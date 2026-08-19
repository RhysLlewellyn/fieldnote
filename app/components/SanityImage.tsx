import Image from 'next/image'

import {urlForImage} from '@/sanity/lib/image'
import type {SanityImage as SanityImageValue} from '@/sanity/lib/types'

type Props = {
  image: SanityImageValue
  /**
   * The widest this image is ever drawn, in CSS pixels. Sanity is asked for
   * exactly this much and no more — the point of a CDN is not sending a
   * 4000px original to fill a 700px column.
   */
  width: number
  /**
   * Crop to this ratio (16 / 9, 1, and so on) using the editor's hotspot.
   * Leave it out to keep the image's own proportions.
   */
  aspect?: number
  /** The `sizes` attribute. Required, because getting it wrong is expensive. */
  sizes: string
  priority?: boolean
  className?: string
}

/**
 * A Sanity image drawn through next/image.
 *
 * Height always comes from real numbers — the crop ratio if there is one, the
 * asset's own dimensions if not — so the browser reserves the right space and
 * the page does not jump when the image lands.
 */
export function SanityImage({
  image,
  width,
  aspect,
  sizes,
  priority = false,
  className,
}: Props) {
  // The asset reference can be absent — an editor can add an image block and
  // save before choosing a file. Rendering nothing beats rendering a broken
  // image with a valid-looking caption underneath it.
  if (!image.asset) return null

  const ratio = aspect ?? image.asset.metadata?.dimensions?.aspectRatio ?? 3 / 2
  const height = Math.round(width / ratio)
  const lqip = image.asset.metadata?.lqip ?? undefined

  const src = aspect
    ? urlForImage(image).width(width).height(height).fit('crop').url()
    : urlForImage(image).width(width).url()

  return (
    <Image
      src={src}
      // Alt text is required by the schema, so an empty string here means the
      // image is decorative rather than that someone forgot.
      alt={image.alt ?? ''}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      placeholder={lqip ? 'blur' : 'empty'}
      blurDataURL={lqip}
      className={className}
    />
  )
}
