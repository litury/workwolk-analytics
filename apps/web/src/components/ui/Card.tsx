'use client'

import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type CardVariant = 'default' | 'blur' | 'bordered'
type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'card'
type CardHover = 'none' | 'lift' | 'glow'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: CardPadding
  hover?: CardHover
}

const getCardClasses = (
  variant: CardVariant = 'default',
  padding: CardPadding = 'card',
  hover: CardHover = 'none'
) => {
  const baseClasses = 'rounded-card border border-border-primary transition-all duration-200'

  const variantClasses = {
    default: 'bg-background-secondary',
    blur: 'bg-background-secondary backdrop-premium',
    bordered: 'bg-transparent border-2',
  }

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    card: 'p-[var(--spacing-card)]',
  }

  const hoverClasses = {
    none: '',
    lift: 'hover:scale-[1.02] hover:shadow-lg',
    glow: 'gold-glow-hover',
  }

  return cn(baseClasses, variantClasses[variant], paddingClasses[padding], hoverClasses[hover])
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover, ...props }, ref) => {
    return (
      <div
        className={cn(getCardClasses(variant, padding, hover), className)}
        ref={ref}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'
