import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ServiceDetailView from './ServiceDetailView'
import { SERVICES, type ServiceSlug } from './services-data'

/* =====================================================================
   SERVICE DETAIL — server entry. Handles generateStaticParams + meta,
   then delegates to the 'use client' ServiceDetailView for FAQ accordion
   + tier interactivity.

   IMPORTANT: SERVICES + types are imported from the SERVER-SAFE
   ./services-data.tsx module — NOT from ServiceDetailView (which is a
   'use client' file). Importing data from a client module hides it
   behind the client-bundle boundary at build time, leaving
   generateStaticParams() returning [] and every detail route 404ing in
   production. This split fixes that.
   ===================================================================== */

export function generateStaticParams() {
  return (Object.keys(SERVICES) as ServiceSlug[]).map((slug) => ({ slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const data = SERVICES[slug as ServiceSlug]

  if (!data) {
    return { title: 'Service not found · Design Vortek' }
  }

  return {
    title: `${data.title} · Design Vortek`,
    description: data.metaDescription,
    alternates: { canonical: `/services/${data.slug}` },
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = SERVICES[slug as ServiceSlug]

  if (!data) {
    notFound()
  }

  return <ServiceDetailView data={data} />
}
