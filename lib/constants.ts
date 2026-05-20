export const SITE_NAME = 'Design Vortek'
export const SITE_URL = 'https://designvortek.com'
export const SITE_TAGLINE = 'Premium Art Commissions'
export const SITE_DESCRIPTION =
  'Painterly TTRPG portraits, VTT tokens, party illustrations and custom art — crafted by hand. Commissions from $80. 7–14 day turnaround.'

export const NAV_LINKS = [
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Services', href: '/services', hasDropdown: true },
  { label: 'Process',   href: '/process' },
  { label: 'Pricing',   href: '/pricing' },
  { label: 'About',     href: '/about' },
  { label: 'Blog',      href: '/blog' },
]

export const SERVICES_NAV = [
  { label: 'Character Art',    href: '/services/character-art' },
  { label: 'VTT Tokens',       href: '/services/vtt-tokens' },
  { label: 'Party Portraits',  href: '/services/party-portraits' },
  { label: 'NPC Packs',        href: '/services/npc-packs' },
  { label: 'Custom Projects',  href: '/services/custom-projects' },
]

export const FOOTER_LINKS = {
  Studio: [
    { label: 'About',        href: '/about' },
    { label: 'Process',      href: '/process' },
    { label: 'Pricing',      href: '/pricing' },
    { label: 'Availability', href: '/availability' },
  ],
  Services: SERVICES_NAV,
  Resources: [
    { label: 'Blog',       href: '/blog' },
    { label: 'FAQ',        href: '/faq' },
    { label: 'Reviews',    href: '/reviews' },
    { label: 'Order Form', href: '/order' },
  ],
  Legal: [
    { label: 'Privacy Policy',    href: '/privacy' },
    { label: 'Terms of Service',  href: '/terms' },
    { label: 'Refund Policy',     href: '/refunds' },
    { label: 'Contact',           href: '/contact' },
  ],
}

export const HERO_TRUST_STATS = [
  { value: '500+', label: 'commissions delivered' },
  { value: '4.9',  label: 'across 247 reviews', stars: true },
  { value: '48h',  label: 'average response' },
]

export const HERO_THUMBS = [
  { label: 'Character Art', gradient: 'from-violet-950 via-purple-800 to-indigo-700' },
  { label: 'VTT Token',     gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
  { label: 'Anime',         gradient: 'from-rose-950 via-pink-800 to-fuchsia-700' },
  { label: 'Party',         gradient: 'from-emerald-950 via-teal-800 to-cyan-700' },
]
