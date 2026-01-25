'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAnalytics, getVacancies, type IAnalytics, type IVacancy } from '@/lib/api'
import type { TerminalView } from '@/types/terminal'
import MobileMenu from '@/components/MobileMenu'
import SnakeGame from '@/components/SnakeGame'
import HomeView from '@/components/terminal/HomeView'
import StatusView from '@/components/terminal/StatusView'
import VacanciesView from '@/components/terminal/VacanciesView'
import SalariesView from '@/components/terminal/SalariesView'
import SkillsView from '@/components/terminal/SkillsView'
import TrendsView from '@/components/terminal/TrendsView'

export default function Home() {
  const [activeView, setActiveView] = useState<TerminalView>('home')
  const [analytics, setAnalytics] = useState<IAnalytics | null>(null)
  const [vacancies, setVacancies] = useState<IVacancy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [analyticsData, vacanciesData] = await Promise.all([
          getAnalytics(),
          getVacancies({ limit: 50 })
        ])
        setAnalytics(analyticsData)
        setVacancies(vacanciesData.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])
  return (
    <main className="terminal-grid scanlines noise relative h-screen-safe overflow-hidden">
      {/* Matrix Rain Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-[10%] data-stream text-xs" style={{ animationDelay: '0s' }}>01001000</div>
        <div className="absolute top-20 left-[30%] data-stream text-xs" style={{ animationDelay: '1s' }}>11010011</div>
        <div className="absolute top-0 left-[50%] data-stream text-xs" style={{ animationDelay: '2s' }}>10110101</div>
        <div className="absolute top-32 left-[70%] data-stream text-xs" style={{ animationDelay: '0.5s' }}>01110010</div>
        <div className="absolute top-16 left-[85%] data-stream text-xs" style={{ animationDelay: '1.5s' }}>11001101</div>
      </div>

      {/* Simplified Layout - ONE flex level */}
      <div className="h-full flex flex-col items-center relative px-5 py-4 md:py-6">
        <div className="w-full max-w-6xl h-full flex flex-col gap-2 md:gap-3">
          {/* Compact Single-Line Header - только на desktop */}
          <div className="shrink-0 hidden md:flex items-center gap-3 text-xs">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 text-[var(--text-muted)] font-mono">
              <span className="pulse">●</span>
              <span className="tracking-wide">SYSTEM_ONLINE</span>
            </div>

            {/* Divider */}
            <span className="text-[var(--border-color)]">|</span>

            {/* Compact ASCII Logo */}
            <span className="text-[var(--text-primary)] font-mono neon-glow">
              ▓▓ WORKWOLK ▓▓
            </span>

            {/* Divider */}
            <span className="text-[var(--border-color)]">|</span>

            {/* Title */}
            <h1
              className="text-sm font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}
            >
              АГРЕГАТОР ДАННЫХ IT РЫНКА
            </h1>

            {/* Divider */}
            <span className="text-[var(--border-color)]">|</span>

            {/* Scrolling Platforms Marquee */}
            <div className="flex-1 overflow-hidden relative h-4">
              <div className="absolute whitespace-nowrap platforms-marquee font-mono text-[var(--text-muted)]">
                {'>'} HH.ru • Habr Career • HeadHunter • Хабр Карьера • HH.ru • Habr Career
              </div>
            </div>

            {/* Version */}
            <span className="text-[var(--text-muted)] font-mono ml-auto">v0.1.0</span>
          </div>

          {/* Divider Line */}
          <div className="h-[1px] bg-[var(--border-color)] hidden md:block shrink-0"></div>

          {/* Terminal Box - занимает всё доступное пространство */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="border-2 border-[var(--border-color)] box-glow relative bg-[var(--bg-secondary)] flex flex-col h-full">
              {/* Terminal Window Header */}
              <div className="flex items-center gap-2 px-5 py-4 md:px-8 md:py-5 border-b border-[var(--border-color)] shrink-0">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[var(--accent-pink)]"></div>
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{ background: 'var(--text-secondary)' }}></div>
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[var(--accent-cyan)]"></div>
                <span className="ml-2 text-[10px] md:text-xs text-[var(--text-muted)] hidden sm:inline font-mono">terminal://workwolk/{activeView}</span>
                <span className="ml-1.5 text-[10px] md:text-xs text-[var(--text-muted)] sm:hidden font-mono">term://{activeView}</span>
              </div>

              {/* Content Area - Flexible */}
              <div className="flex-1 p-5 md:p-8 overflow-y-auto terminal-scrollbar min-h-0">
                <AnimatePresence mode="wait">
                  {activeView === 'home' && (
                    <motion.div
                      key="home"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <HomeView analytics={analytics} loading={loading} />
                    </motion.div>
                  )}
                  {activeView === 'status' && (
                    <motion.div
                      key="status"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <StatusView analytics={analytics} loading={loading} error={error} />
                    </motion.div>
                  )}
                  {activeView === 'vacancies' && (
                    <motion.div
                      key="vacancies"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <VacanciesView analytics={analytics} vacancies={vacancies} loading={loading} />
                    </motion.div>
                  )}
                  {activeView === 'salaries' && (
                    <motion.div
                      key="salaries"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SalariesView analytics={analytics} loading={loading} />
                    </motion.div>
                  )}
                  {activeView === 'skills' && (
                    <motion.div
                      key="skills"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SkillsView analytics={analytics} loading={loading} />
                    </motion.div>
                  )}
                  {activeView === 'trends' && (
                    <motion.div
                      key="trends"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TrendsView analytics={analytics} loading={loading} />
                    </motion.div>
                  )}
                  {activeView === 'game' && (
                    <motion.div
                      key="game"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SnakeGame />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation Footer */}
              <div className="border-t border-[var(--border-color)] shrink-0">
                {/* Desktop Navigation - 6 buttons */}
                <div className="hidden md:block px-8 py-5">
                  <div className="flex flex-wrap gap-2 font-mono">
                    <motion.button
                      initial={{ opacity: 0, scale: 0.85, x: -8 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                      disabled={loading}
                      onClick={() => setActiveView('home')}
                      aria-label="Главная страница"
                      aria-pressed={activeView === 'home'}
                      className={`px-4 py-2 border transition-all cursor-pointer touch-manipulation text-xs ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      } ${
                        activeView === 'home'
                          ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]'
                          : 'border-[var(--border-color)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
                      }`}
                    >
                      [HOME]
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.85, x: -8 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                      disabled={loading}
                      onClick={() => setActiveView('vacancies')}
                      aria-label="Показать вакансии"
                      aria-pressed={activeView === 'vacancies'}
                      className={`px-4 py-2 border transition-all cursor-pointer touch-manipulation text-xs ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      } ${
                        activeView === 'vacancies'
                          ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]'
                          : 'border-[var(--border-color)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
                      }`}
                    >
                      [ВАКАНСИИ]
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.85, x: -8 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
                      disabled={loading}
                      onClick={() => setActiveView('salaries')}
                      aria-label="Показать зарплаты"
                      aria-pressed={activeView === 'salaries'}
                      className={`px-4 py-2 border transition-all cursor-pointer touch-manipulation text-xs ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      } ${
                        activeView === 'salaries'
                          ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]'
                          : 'border-[var(--border-color)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
                      }`}
                    >
                      [ЗАРПЛАТЫ]
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.85, x: -8 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
                      disabled={loading}
                      onClick={() => setActiveView('skills')}
                      aria-label="Показать навыки"
                      aria-pressed={activeView === 'skills'}
                      className={`px-4 py-2 border transition-all cursor-pointer touch-manipulation text-xs ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      } ${
                        activeView === 'skills'
                          ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]'
                          : 'border-[var(--border-color)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
                      }`}
                    >
                      [НАВЫКИ]
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.85, x: -8 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
                      disabled={loading}
                      onClick={() => setActiveView('trends')}
                      aria-label="Показать тренды"
                      aria-pressed={activeView === 'trends'}
                      className={`px-4 py-2 border transition-all cursor-pointer touch-manipulation text-xs ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      } ${
                        activeView === 'trends'
                          ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]'
                          : 'border-[var(--border-color)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
                      }`}
                    >
                      [ТРЕНДЫ]
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.85, x: -8 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
                      disabled={loading}
                      onClick={() => setActiveView('game')}
                      aria-label="Играть в змейку"
                      aria-pressed={activeView === 'game'}
                      className={`px-4 py-2 border transition-all cursor-pointer touch-manipulation text-xs ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      } ${
                        activeView === 'game'
                          ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]'
                          : 'border-[var(--border-color)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]'
                      }`}
                    >
                      [ИГРА]
                    </motion.button>
                  </div>
                </div>

                {/* Mobile Navigation - hamburger button only */}
                <div className="md:hidden px-5 py-3 flex items-center justify-center">
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="px-4 py-2 border border-[var(--border-color)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all font-mono text-xs"
                    aria-label="Open menu"
                  >
                    ☰ MENU
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - только на desktop */}
          <div className="shrink-0 hidden md:block">
            <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs mb-1">
              <a
                href="https://t.me/litury"
                className="hover:text-[var(--text-primary)] hover:neon-glow transition-all font-mono tracking-wide"
              >
                TG
              </a>
              <span>|</span>
              <a
                href="https://github.com/litury/workwolk-analytics"
                className="hover:text-[var(--text-primary)] hover:neon-glow transition-all font-mono tracking-wide"
              >
                GH
              </a>
              <span className="ml-auto pulse">●</span>
              <span className="font-mono">READY</span>
            </div>
            <div className="h-px bg-[var(--border-color)]"></div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeView={activeView}
        onViewChange={setActiveView}
        loading={loading}
      />
    </main>
  )
}
