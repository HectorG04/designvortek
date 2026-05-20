'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, ArrowRight } from 'lucide-react'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import Button from '@/components/ui/Button'
import { BLOG_PREVIEW } from '@/lib/constants'
import { cn } from '@/lib/utils'

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function BlogPreview() {
  return (
    <section className="bg-parchment-100 py-24 md:py-32">
      <Container>
        {/* Section head */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="text-center max-w-[720px] mx-auto mb-16"
        >
          <motion.div variants={fadeUp} className="mb-4 flex justify-center">
            <SectionLabel>From the studio</SectionLabel>
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight">
            Field notes &amp; <em className="font-display italic font-medium text-burgundy-700">process</em>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-ink-500 mt-4 leading-relaxed">
            Guides on commissioning art, walkthroughs of recent pieces, and thoughts on what makes a good portrait.
          </motion.p>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {BLOG_PREVIEW.map((post) => (
            <motion.article key={post.slug} variants={fadeUp}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block bg-parchment-50 border border-border-light rounded-2xl overflow-hidden hover:border-border-medium hover:shadow-[0_12px_32px_rgba(30,20,8,0.10)] transition-shadow h-full"
              >
                {/* Featured image placeholder */}
                <div className={cn(
                  'relative aspect-[16/10] flex items-end p-4',
                  `bg-gradient-to-br ${post.gradient}`
                )}>
                  <span className="inline-block bg-tome-950/65 backdrop-blur-md border border-cream-50/15 text-cream-50 text-[0.625rem] tracking-[0.15em] uppercase font-bold px-2.5 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col">
                  <h4 className="font-display text-xl font-semibold text-ink-900 leading-snug mb-3 group-hover:text-burgundy-700 transition-colors line-clamp-3">
                    {post.title}
                  </h4>

                  <div className="flex items-center gap-2 text-xs text-ink-500 mb-3">
                    <span>{post.date}</span>
                    <span className="w-1 h-1 rounded-full bg-ink-400" aria-hidden="true" />
                    <span className="inline-flex items-center gap-1">
                      <Clock size={11} strokeWidth={1.8} />
                      {post.readTime}
                    </span>
                  </div>

                  <p className="text-sm text-ink-700 leading-relaxed">{post.excerpt}</p>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button href="/blog" variant="outline" size="md">
            Read all articles <ArrowRight size={14} strokeWidth={1.8} />
          </Button>
        </div>
      </Container>
    </section>
  )
}
