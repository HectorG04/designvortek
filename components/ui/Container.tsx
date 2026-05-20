import { cn } from '@/lib/utils'

interface ContainerProps {
  children: React.ReactNode
  className?: string
  narrow?: boolean
  as?: React.ElementType
}

export default function Container({
  children,
  className,
  narrow = false,
  as: Component = 'div',
}: ContainerProps) {
  return (
    <Component
      className={cn(
        'mx-auto w-full px-6 md:px-12',
        narrow ? 'max-w-3xl' : 'max-w-[1280px]',
        className
      )}
    >
      {children}
    </Component>
  )
}
