'use client'

import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'
type ButtonRounded = 'default' | 'full' | 'button'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  rounded?: ButtonRounded
}

const getButtonClasses = (
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  rounded: ButtonRounded = 'button'
) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 interactive-element disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'bg-accent-primary text-white hover:bg-accent-secondary',
    secondary: 'bg-transparent border border-border-primary text-text-primary hover:bg-background-secondary',
    ghost: 'bg-transparent text-text-secondary hover:text-accent-primary',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const roundedClasses = {
    default: 'rounded-md',
    full: 'rounded-full',
    button: 'rounded-[1.875rem]',
  }

  return cn(baseClasses, variantClasses[variant], sizeClasses[size], roundedClasses[rounded])
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, ...props }, ref) => {
    return (
      <button
        className={cn(getButtonClasses(variant, size, rounded), className)}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
