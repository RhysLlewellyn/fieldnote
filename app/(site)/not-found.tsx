import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-20">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Not found
      </h1>
      <p className="mt-4 text-black/70 dark:text-white/70">
        That address does not match anything published. It may have moved, or
        the link may be wrong.
      </p>
      <p className="mt-6">
        <Link href="/" className="underline underline-offset-4 hover:no-underline">
          Back to the homepage
        </Link>
      </p>
    </div>
  )
}
