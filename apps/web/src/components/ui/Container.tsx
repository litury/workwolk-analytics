'use client'

import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type ContainerMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
type ContainerPadding = 'none' | 'sm' | 'md' | 'lg'

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  maxWidth?: ContainerMaxWidth
  padding?: ContainerPadding
}

const getContainerClasses = (
  maxWidth: ContainerMaxWidth = 'xl',
  padding: ContainerPadding = 'md'
) => {
  const baseClasses = 'mx-auto w-full'

  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  }

  const paddingClasses = {
    none: 'px-0',
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8',
  }

  return cn(baseClasses, maxWidthClasses[maxWidth], paddingClasses[padding])
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth, padding, ...props }, ref) => {
    return (
      <div
        className={cn(getContainerClasses(maxWidth, padding), className)}
        ref={ref}
        {...props}
      />
    )
  }
)

Container.displayName = 'Container'
