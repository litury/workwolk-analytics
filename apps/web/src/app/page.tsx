'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAnalytics, getVacancies, type IAnalytics, type IVacancy } from '@/lib/api'
import type { TerminalView } from '@/types/terminal'
import { Container } from '@/components/ui'
import { Navigation } from '@/components/ui/Navigation'
import HomeView from '@/components/terminal/HomeView'
import StatusView from '@/components/terminal/StatusView'
import VacanciesView from '@/components/terminal/VacanciesView'
import SalariesView from '@/components/terminal/SalariesView'
import SkillsView from '@/components/terminal/SkillsView'
import TrendsView from '@/components/terminal/TrendsView'

const views = [
  { id: 'home', label: 'Главная' },
  { id: 'vacancies', label: 'Вакансии' },
  { id: 'salaries', label: 'Зарплаты' },
  { id: 'skills', label: 'Навыки' },
  { id: 'trends', label: 'Тренды' },
  { id: 'status', label: 'Статистика' },
] as const

export default function Home() {
  const [activeView, setActiveView] = useState<TerminalView>('home')
  const [analytics, setAnalytics] = useState<IAnalytics | null>(null)
  const [vacancies, setVacancies] = useState<IVacancy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [analyticsData, vacanciesData] = await Promise.all([
          getAnalytics(),
          getVacancies({ limit: 50 }),
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
    <div className="min-h-screen bg-background-primary flex flex-col">
      {/* Navigation */}
      <Navigation
        currentView={activeView}
        onViewChange={(view) => setActiveView(view as TerminalView)}
        views={views}
      />

      {/* Main Content */}
      <main className="flex-1 py-8">
        <Container maxWidth="2xl">
          <AnimatePresence mode="wait">
            {activeView === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <HomeView analytics={analytics} loading={loading} />
              </motion.div>
            )}
            {activeView === 'status' && (
              <motion.div
                key="status"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StatusView analytics={analytics} loading={loading} error={error} />
              </motion.div>
            )}
            {activeView === 'vacancies' && (
              <motion.div
                key="vacancies"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <VacanciesView analytics={analytics} vacancies={vacancies} loading={loading} />
              </motion.div>
            )}
            {activeView === 'salaries' && (
              <motion.div
                key="salaries"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SalariesView analytics={analytics} loading={loading} />
              </motion.div>
            )}
            {activeView === 'skills' && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SkillsView analytics={analytics} loading={loading} />
              </motion.div>
            )}
            {activeView === 'trends' && (
              <motion.div
                key="trends"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TrendsView analytics={analytics} loading={loading} />
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-primary bg-background-secondary mt-16">
        <Container maxWidth="2xl">
          <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-4">
              <a
                href="/about"
                className="text-text-secondary hover:text-accent-primary transition-all duration-200"
              >
                О проекте
              </a>
              <span className="text-border-primary">|</span>
              <a
                href="https://t.me/litury"
                className="text-text-secondary hover:text-accent-primary transition-all duration-200"
              >
                Telegram
              </a>
              <span className="text-border-primary">|</span>
              <a
                href="https://github.com/litury/workwolk-analytics"
                className="text-text-secondary hover:text-accent-primary transition-all duration-200"
              >
                GitHub
              </a>
            </div>
            <div className="text-center md:text-right">
              <div className="text-text-primary font-medium">WorkWolk</div>
              <div className="text-text-secondary text-xs mt-1">
                Охотник за зарплатами
              </div>
              <div className="text-text-tertiary text-xs mt-1">
                v0.1.0 • Обновлено: {new Date().toLocaleDateString('ru-RU')}
              </div>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  )
}
