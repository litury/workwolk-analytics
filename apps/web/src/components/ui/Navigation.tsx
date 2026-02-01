'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './ThemeToggle'

interface NavigationProps {
  currentView: string
  onViewChange: (view: string) => void
  views: ReadonlyArray<{ readonly id: string; readonly label: string }>
}

export function Navigation({ currentView, onViewChange, views }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-background-primary border-b border-border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span className="text-lg font-display font-medium tracking-[0.125rem] text-accent-primary">
              WORKWOLK
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className={cn(
                  'px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all duration-200',
                  currentView === view.id
                    ? 'text-accent-primary border-b-2 border-accent-primary'
                    : 'text-text-secondary hover:text-accent-secondary'
                )}
              >
                {view.label}
              </button>
            ))}
            <div className="ml-4">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-text-primary hover:text-accent-primary hover:bg-background-secondary transition-all duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-primary">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-background-secondary">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => {
                  onViewChange(view.id)
                  setMobileMenuOpen(false)
                }}
                className={cn(
                  'block w-full text-left px-3 py-2 rounded-md text-sm font-medium uppercase tracking-wide transition-all duration-200',
                  currentView === view.id
                    ? 'bg-background-tertiary text-accent-primary font-bold'
                    : 'text-text-secondary hover:text-accent-primary hover:bg-background-tertiary'
                )}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
