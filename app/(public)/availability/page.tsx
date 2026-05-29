import type { Metadata } from 'next'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import AvailabilityClient from './_AvailabilityClient'

export const metadata: Metadata = {
  title: 'Commission Slot Availability | Design Vortex',
  description:
    'Check current commission availability. We take a fixed number of pieces each month so every piece gets the attention it deserves.',
  alternates: { canonical: '/availability' },
}

export default function AvailabilityPage() {
  return (
    <>
      <SiteHeader />
      <AvailabilityClient />
      <SiteFooter />
    </>
  )
}
