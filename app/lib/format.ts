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
