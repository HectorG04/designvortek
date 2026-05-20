import type { Metadata } from 'next'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import ContactClient from './_ContactClient'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Ask a question, send a note, or start a conversation. We reply within 48 hours, every weekday.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <ContactClient />
      <SiteFooter />
    </>
  )
}
