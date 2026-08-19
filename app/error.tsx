'use client'

/**
 * The page an unhandled error lands on.
 *
 * Next has a default, and it looks like a different website — which is a poor
 * moment to tell a reader they have left the one they were on. This keeps the
 * paper, the faces and the rules.
 *
 * It cannot use the site's fonts through next/font (this renders outside the
 * layout in some failure modes), so it leans on the tokens, which come from
 * the stylesheet rather than the layout.
 */
export default function Error({reset}: {error: Error; reset: () => void}) {
  return (
    <div className="mx-auto max-w-[1100px] px-8 py-24">
      <div className="max-w-[34rem]">
        <p className="font-meta text-[0.7rem] tracking-[0.14em] text-ochre uppercase">
          Error
        </p>
        <h1 className="font-display mt-3 text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.02] font-light tracking-[-0.028em]">
          Something went wrong
        </h1>
        <p className="mt-5 text-[1.3rem] leading-[1.5] italic">
          This page failed to load. It is not something you did.
        </p>
        <p className="mt-8 font-meta text-[0.7rem] tracking-[0.14em] uppercase">
          <button
            type="button"
            onClick={reset}
            className="text-ochre underline underline-offset-4 hover:text-ink"
          >
            Try again
          </button>
        </p>
      </div>
    </div>
  )
}
