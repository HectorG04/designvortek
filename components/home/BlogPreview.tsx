'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, ArrowRight } from 'lucide-react'
import Container from '@/components/ui/Container'
import SectionHead from '@/components/ui/SectionHead'
import { LinkButton } from '@/components/ui/Button'
import { BLOG_PREVIEW } from '@/lib/constants'

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function BlogPreview() {
  return (
    <section className="bg-parchment-100 py-16 md:py-32">
      <Container>
        <SectionHead
          eyebrow="From the studio"
          title={<>Field notes &amp; <em>process</em></>}
          description="Guides on commissioning art, walkthroughs of recent pieces, and thoughts on what makes a good portrait."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5"
        >
          {BLOG_PREVIEW.map((post) => (
            <motion.article
              key={post.slug}
              variants={fadeUp}
              className="group bg-parchment-50 border border-border-light rounded-xl overflow-hidden transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-border-medium hover:shadow-md hover:-translate-y-1 cursor-pointer"
            >
              <Link href={`/resources/${post.slug}`} className="block">
                {/* Image area with gradient */}
                <div
                  className={`relative aspect-[16/9] p-[14px] flex items-start bg-gradient-to-br ${post.gradient}`}
                >
                  <span className="font-body text-[0.625rem] font-bold uppercase tracking-[0.15em] text-ink-900 bg-parchment-50/[0.92] backdrop-blur-sm border border-gold-300 px-2.5 py-[5px] rounded-full">
                    {post.category}
                  </span>
                </div>

                {/* Body */}
                <div className="px-6 pb-6 pt-5">
                  <h4 className="font-display text-[1.375rem] font-bold text-ink-900 leading-[1.25] tracking-[-0.015em] mb-[10px] group-hover:text-burgundy-700 transition-colors">
                    {post.title}
                  </h4>

                  <div className="flex items-center gap-2.5 mb-[14px]">
                    <span className="font-body text-[0.6875rem] font-bold uppercase tracking-[0.15em] text-gold-700">
                      {post.date}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gold-500 flex-shrink-0" />
                    <span className="inline-flex items-center gap-[5px] text-[0.8125rem] text-ink-500 tabular-nums">
                      <Clock size={12} strokeWidth={1.6} className="text-ink-400" />
                      {post.readTime}
                    </span>
                  </div>

                  <p className="text-[0.9375rem] text-ink-700 leading-[1.55]">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>

        {/* Footer link */}
        <div className="text-center mt-12">
          <LinkButton href="/resources" variant="outline" size="md">
            Read all articles
            <ArrowRight size={14} strokeWidth={1.8} />
          </LinkButton>
        </div>
      </Container>
    </section>
  )
}
