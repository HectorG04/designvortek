import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-parchment-50 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-display text-burgundy-700 text-[10rem] leading-none mb-4">404</p>
        <h1 className="font-display text-3xl text-ink-900 mb-3">This page wandered into the wilds.</h1>
        <p className="text-ink-500 mb-8">
          Let&rsquo;s get you back on the trail.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-burgundy-700 text-cream-50 text-xs font-semibold tracking-[0.12em] uppercase px-8 py-3.5 rounded-full hover:bg-burgundy-500 transition shadow-sm hover:shadow-md"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
