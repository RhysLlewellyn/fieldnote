/**
 * The Studio, served from the same deployment as the site.
 *
 * One deploy, one domain, one thing for a client to bookmark — which is the
 * point of embedding it rather than hosting it separately on sanity.studio.
 */
import {NextStudio} from 'next-sanity/studio'

import config from '../../../sanity.config'

export const dynamic = 'force-static'

export {metadata, viewport} from 'next-sanity/studio'

export default function StudioPage() {
  return <NextStudio config={config} />
}
