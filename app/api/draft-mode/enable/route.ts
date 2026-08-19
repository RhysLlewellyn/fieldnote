import {defineEnableDraftMode} from 'next-sanity/draft-mode'

import {client} from '@/sanity/lib/client'

/**
 * Turns draft mode on, and is what the Presentation tool in the Studio points
 * at when an editor opens a preview.
 *
 * next-sanity validates the request against the Studio before setting the
 * cookie, so this cannot be used by a passer-by to read unpublished work —
 * the token below never leaves the server either way.
 */
export const {GET} = defineEnableDraftMode({
  client: client.withConfig({token: process.env.SANITY_API_READ_TOKEN}),
})
