'use client'

import { type HTMLAttributes, forwardRef, createElement } from 'react'
import { cn } from '@/lib/utils'

// Heading component
type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
type HeadingWeight = 'normal' | 'medium' | 'bold'
type HeadingColor = 'primary' | 'secondary' | 'accent'

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel
  weight?: HeadingWeight
  color?: HeadingColor
  uppercase?: boolean
}

const getHeadingClasses = (
  level: HeadingLevel = 'h2',
  weight: HeadingWeight = 'bold',
  color: HeadingColor = 'primary',
  uppercase?: boolean
) => {
  const baseClasses = 'font-display'

  const levelClasses = {
    h1: 'text-4xl leading-tight',
    h2: 'text-3xl leading-snug',
    h3: 'text-2xl leading-normal',
    h4: 'text-xl leading-normal',
    h5: 'text-lg leading-normal',
    h6: 'text-base leading-normal',
  }

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    bold: 'font-bold',
  }

  const colorClasses = {
    primary: 'text-text-primary',
    secondary: 'text-text-secondary',
    accent: 'text-accent-primary',
  }

  return cn(
    baseClasses,
    levelClasses[level],
    weightClasses[weight],
    colorClasses[color],
    uppercase && 'uppercase tracking-wide'
  )
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 'h2', weight, color, uppercase, children, ...props }, ref) => {
    return createElement(
      level,
      {
        className: cn(getHeadingClasses(level, weight, color, uppercase), className),
        ref,
        ...props,
      },
      children
    )
  }
)

Heading.displayName = 'Heading'

// Text component
type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl'
type TextWeight = 'normal' | 'medium' | 'bold'
type TextColor = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'accentSecondary'
type TextAs = 'p' | 'span' | 'div'

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  size?: TextSize
  weight?: TextWeight
  color?: TextColor
  as?: TextAs
}

const getTextClasses = (
  size: TextSize = 'base',
  weight: TextWeight = 'normal',
  color: TextColor = 'primary'
) => {
  const baseClasses = 'font-body'

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    bold: 'font-bold',
  }

  const colorClasses = {
    primary: 'text-text-primary',
    secondary: 'text-text-secondary',
    tertiary: 'text-text-tertiary',
    accent: 'text-accent-primary',
    accentSecondary: 'text-accent-secondary',
  }

  return cn(baseClasses, sizeClasses[size], weightClasses[weight], colorClasses[color])
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, size, weight, color, as = 'p', ...props }, ref) => {
    return createElement(as, {
      className: cn(getTextClasses(size, weight, color), className),
      ref,
      ...props,
    })
  }
)

Text.displayName = 'Text'
