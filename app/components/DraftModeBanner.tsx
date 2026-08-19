import Link from 'next/link'

/**
 * Shown only while draft mode is on.
 *
 * A preview that looks exactly like the live site is how people end up
 * reporting bugs against unpublished content, so this is deliberately hard to
 * miss and carries the way out.
 */
export function DraftModeBanner() {
  return (
    <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 bg-amber-400 px-5 py-2 text-sm text-black">
      <p>
        <strong className="font-semibold">Previewing drafts.</strong> This is
        not what the public sees.
      </p>
      <Link href="/api/draft-mode/disable" className="underline underline-offset-4">
        Leave preview
      </Link>
    </div>
  )
}
