import Link from 'next/link'

/**
 * Shown only while draft mode is on.
 *
 * A preview that looks exactly like the live site is how people end up
 * reporting bugs against unpublished content, so this is deliberately hard to
 * miss and carries the way out. Paper on ink rather than the usual warning
 * yellow, because it still has to belong to the design — and because ochre,
 * darkened for contrast against paper, does not have the headroom to sit on
 * ink as well.
 */
export function DraftModeBanner() {
  return (
    <div className="sticky top-0 z-50 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 bg-ink px-8 py-2.5 font-meta text-[0.7rem] tracking-[0.14em] text-paper uppercase">
      <p>
        <span className="font-medium">Previewing drafts</span> — not what the
        public sees
      </p>
      <Link href="/api/draft-mode/disable" className="underline underline-offset-4">
        Leave preview
      </Link>
    </div>
  )
}
