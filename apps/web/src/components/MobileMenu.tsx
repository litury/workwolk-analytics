'use client'
import { motion, AnimatePresence } from 'framer-motion'
import type { TerminalView } from '@/types/terminal'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  activeView: TerminalView
  onViewChange: (view: TerminalView) => void
  loading: boolean
}

export default function MobileMenu({ isOpen, onClose, activeView, onViewChange, loading }: MobileMenuProps) {
  const menuItems: { view: TerminalView; label: string }[] = [
    { view: 'status', label: '[STATUS]' },
    { view: 'vacancies', label: '[ВАКАНСИИ]' },
    { view: 'salaries', label: '[ЗАРПЛАТЫ]' },
    { view: 'skills', label: '[НАВЫКИ]' },
    { view: 'trends', label: '[ТРЕНДЫ]' },
    { view: 'game', label: '[ИГРА]' },
  ]

  const handleItemClick = (view: TerminalView) => {
    onViewChange(view)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
          />

          {/* Slide-out Menu */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-64 bg-[var(--bg-secondary)] border-r-2 border-[var(--border-color)] box-glow z-50 md:hidden overflow-y-auto"
          >
            {/* Menu Header */}
            <div className="border-b border-[var(--border-color)] px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-[var(--accent-cyan)] font-mono text-xs neon-glow">MENU</span>
                <button
                  onClick={onClose}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2 font-mono">
              {menuItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => handleItemClick(item.view)}
                  disabled={loading}
                  className={`w-full text-left px-4 py-3 border transition-all text-xs ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    activeView === item.view
                      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]'
                      : 'border-[var(--border-color)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Menu Footer - Links */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--border-color)] px-5 py-4 bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
                <a
                  href="https://t.me/litury"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--text-primary)] hover:neon-glow transition-all font-mono tracking-wide"
                >
                  TG
                </a>
                <span>|</span>
                <a
                  href="https://github.com/litury/workwolk-analytics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--text-primary)] hover:neon-glow transition-all font-mono tracking-wide"
                >
                  GH
                </a>
                <span className="ml-auto pulse">●</span>
                <span className="font-mono text-[9px]">v0.1.0</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
