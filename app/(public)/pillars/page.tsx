import { permanentRedirect } from 'next/navigation'

/* The pillars index has been merged into /resources (Pillars + Studio
 * Notes in one hub). Permanent 308 redirect so search engines update
 * their index. Detail pages at /pillars/[genre] keep working — only
 * the index page redirects. */
export default function PillarsIndexRedirect(): never {
  permanentRedirect('/resources')
}
