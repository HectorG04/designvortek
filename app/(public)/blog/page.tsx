import { permanentRedirect } from 'next/navigation'

/* The blog index has been merged into /resources (Pillars + Studio
 * Notes in one hub). Permanent 308 redirect so search engines update
 * their index. Detail pages at /blog/[slug] and /blog/category/[c]
 * keep working — only the index page redirects. */
export default function BlogIndexRedirect(): never {
  permanentRedirect('/resources')
}
