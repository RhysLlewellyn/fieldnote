import {toPlainText} from 'next-sanity'

import type {BodyBlock} from '@/sanity/lib/types'

/**
 * One date format for the whole site, in one place.
 *
 * The locale is pinned rather than left to the runtime. Next renders these on
 * the server and hydrates on the client, and a server in one region formatting
 * differently from a reader's browser is a hydration mismatch that only shows
 * up for some readers.
 */
export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Short form for byline bars and index rows, where the year is enough. */
export function formatMonthYear(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

/** Words a minute. Editorial prose, not technical documentation. */
const READING_SPEED = 220

/**
 * Reading time, counted from the text that is actually read.
 *
 * Only the prose blocks count: a pull quote is read in passing and a gallery
 * is not read at all, so including them would inflate every estimate on the
 * pieces that lean hardest on imagery.
 */
export function readingTime(body: BodyBlock[] | null | undefined): number {
  if (!body?.length) return 1

  const prose = body.filter(
    (block): block is Extract<BodyBlock, {_type: 'block'}> =>
      block._type === 'block',
  )
  const words = toPlainText(prose).trim().split(/\s+/).filter(Boolean).length

  return Math.max(1, Math.round(words / READING_SPEED))
}
