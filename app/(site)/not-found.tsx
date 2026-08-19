import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1100px] px-8 py-24">
      <div className="max-w-[34rem]">
        <p className="font-meta text-[0.7rem] tracking-[0.14em] text-ochre uppercase">
          404
        </p>
        <h1 className="font-display mt-3 text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.02] font-light tracking-[-0.028em]">
          Not found
        </h1>
        <p className="mt-5 text-[1.3rem] leading-[1.5] italic">
          That address does not match anything published. It may have moved, or
          the link may be wrong.
        </p>
        <p className="mt-8 font-meta text-[0.7rem] tracking-[0.14em] uppercase">
          <Link href="/" className="text-ochre hover:text-ink">
            Back to the front
          </Link>
        </p>
      </div>
    </div>
  )
}
