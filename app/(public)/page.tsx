import type { Metadata } from 'next'
import ComingSoon from './_components/ComingSoon'

export const metadata: Metadata = {
  title: 'Design Vortek — Premium TTRPG & Character Art Commissions',
  description:
    'A premium art studio crafting D&D character art, VTT tokens, party portraits, and custom illustrations. New site launching soon — join the waitlist.',
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return <ComingSoon />
}
