'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load from localStorage or system preference
    const stored = localStorage.getItem('theme') as Theme | null
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    const initialTheme = stored || systemPreference
    setTheme(initialTheme)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Update document class
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)

    // Save to localStorage
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
