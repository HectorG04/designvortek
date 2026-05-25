import type { Metadata } from 'next'
import FAQContent from './_FAQContent'

/* =====================================================================
   FAQ — server shell that owns metadata + renders the interactive
   client component. The FAQ accordion, search, and category nav
   require useState, so the UI lives in _FAQContent.tsx ('use client').
   This file stays a Server Component so Next.js can pick up the
   metadata export for <head> generation and Google's FAQPage schema.
   ===================================================================== */

export const metadata: Metadata = {
  title: 'Art Commission FAQ | Your Questions Answered',
  description:
    'Everything you need to know about commissioning character art — pricing, revisions, turnaround, file formats, rights & more. Read our complete FAQ.',
  alternates: { canonical: '/faq' },
}

export default function FaqPage() {
  return <FAQContent />
}
