import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ServiceDetailView, { SERVICES, type ServiceSlug } from './ServiceDetailView'

export function generateStaticParams() {
  return (Object.keys(SERVICES) as ServiceSlug[]).map((slug) => ({ slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const data = SERVICES[slug as ServiceSlug]

  if (!data) {
    return {
      title: 'Service not found · Design Vortek',
    }
  }

  return {
    title: `${data.title} · Design Vortek`,
    description: data.metaDescription,
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
