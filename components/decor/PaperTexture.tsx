import { cn } from '@/lib/utils'

interface PaperTextureProps {
  className?: string
  variant?: 'parchment' | 'cream'
  opacity?: number
}

/**
 * Aged paper texture overlay.
 * Place inside a relatively-positioned container. Renders absolutely-positioned.
 * 'parchment' (default) = dark ink noise — used on light parchment surfaces.
 * 'cream'              = light cream noise — used on dark tome surfaces.
 */
export default function PaperTexture({
  className,
  variant = 'parchment',
  opacity = 0.5,
}: PaperTextureProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 mix-blend-multiply',
        variant === 'parchment' ? 'paper-texture' : 'paper-texture-cream',
        className
      )}
      style={{ opacity }}
    />
  )
}
