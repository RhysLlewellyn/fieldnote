import {createImageUrlBuilder, type SanityImageSource} from '@sanity/image-url'

import {dataset, projectId} from '../env'

const builder = createImageUrlBuilder({projectId, dataset})

/**
 * Build a URL for a Sanity image.
 *
 * `auto('format')` serves WebP or AVIF to browsers that take it, and `fit`
 * defaults to 'max' so an image is never scaled up past its real size — a
 * small portrait stays small rather than turning to mush.
 *
 * Pass the whole image object, not `image.asset`: the hotspot and crop live on
 * the object, and without them every crop is taken from the centre.
 */
export function urlForImage(source: SanityImageSource) {
  return builder.image(source).auto('format').fit('max')
}
