'use client'

import { cn } from '@/lib/utils'
import { motion, type HTMLMotionProps } from 'framer-motion'
import Link from 'next/link'
import { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'gold' | 'outline' | 'outline-cream' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonBaseProps {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: React.ReactNode
  external?: boolean
}

interface ButtonAsButton
  extends ButtonBaseProps,
    Omit<HTMLMotionProps<'button'>, 'children' | 'className'> {
  href?: undefined
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string
  onClick?: () => void
  type?: never
  disabled?: never
}

type ButtonProps = ButtonAsButton | ButtonAsLink

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-burgundy-700 text-cream-50 hover:bg-burgundy-500 hover:shadow-md hover:-translate-y-px active:bg-burgundy-900',
  gold:
    'bg-gold-500 text-ink-900 hover:bg-gold-300 hover:shadow-[0_8px_24px_rgba(201,160,74,0.32)] hover:-translate-y-px',
  outline:
    'bg-transparent border-[1.5px] border-burgundy-700 text-burgundy-700 hover:bg-burgundy-700 hover:text-cream-50',
  'outline-cream':
    'bg-transparent border-[1.5px] border-cream-200 text-cream-50 hover:bg-cream-50 hover:text-ink-900 hover:border-cream-50',
  ghost:
    'bg-transparent text-ink-700 hover:bg-parchment-100 hover:text-ink-900',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-5 py-[10px] text-[0.6875rem]',
  md: 'px-7 py-[14px] text-xs',
  lg: 'px-9 py-[18px] text-[0.8125rem]',
}

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(
    { variant = 'primary', size = 'md', className, children, ...rest },
    _ref,
  ) {
    const base =
      'inline-flex items-center justify-center gap-2 font-body font-semibold uppercase tracking-[0.12em] rounded-full border-[1.5px] border-transparent transition-all duration-250 ease-out whitespace-nowrap cursor-pointer disabled:bg-ink-300 disabled:text-ink-400 disabled:border-transparent disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 active:scale-[0.98]'

    const classes = cn(base, variantStyles[variant], sizeStyles[size], className)

    if ('href' in rest && rest.href) {
      const { href, external, onClick } = rest
      return (
        <motion.a
          {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
          href={href}
          onClick={onClick}
          className={classes}
          whileTap={{ scale: 0.98 }}
        >
          {children}
        </motion.a>
      )
    }

    const { external: _external, ...buttonProps } = rest as ButtonAsButton
    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        className={classes}
        {...buttonProps}
      >
        {children}
      </motion.button>
    )
  }
)

// Variant: NextLink-based button (for internal routes)
interface LinkButtonProps extends ButtonBaseProps {
  href: string
  prefetch?: boolean
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  href,
  external,
  prefetch,
}: LinkButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-body font-semibold uppercase tracking-[0.12em] rounded-full border-[1.5px] border-transparent transition-all duration-250 ease-out whitespace-nowrap cursor-pointer active:scale-[0.98]'
  const classes = cn(base, variantStyles[variant], sizeStyles[size], className)

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} prefetch={prefetch} className={classes}>
      {children}
    </Link>
  )
}

export default Button
