'use client'

/**
 * Секция с живыми данными - клиентский компонент
 */

import { useEffect, useState } from 'react'
import { getAnalytics, getVacancies, type IAnalytics, type IVacancy } from '@/lib/api'

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'никогда'

  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'только что'
  if (diffMins < 60) return `${diffMins} мин назад`
  if (diffHours < 24) return `${diffHours} ч назад`
  return `${diffDays} дн назад`
}

function formatSalary(vacancy: IVacancy): string {
  if (!vacancy.salaryFrom && !vacancy.salaryTo) return 'не указано'

  const currency = vacancy.currency || 'RUB'
  const symbol = currency === 'RUB' ? '₽' : currency === 'USD' ? '$' : '€'

  if (vacancy.salaryFrom && vacancy.salaryTo) {
    return `${vacancy.salaryFrom.toLocaleString('ru-RU')}–${vacancy.salaryTo.toLocaleString('ru-RU')} ${symbol}`
  }

  if (vacancy.salaryFrom) {
    return `от ${vacancy.salaryFrom.toLocaleString('ru-RU')} ${symbol}`
  }

  if (vacancy.salaryTo) {
    return `до ${vacancy.salaryTo.toLocaleString('ru-RU')} ${symbol}`
  }

  return 'не указано'
}

export default function DataSection() {
  const [analytics, setAnalytics] = useState<IAnalytics | null>(null)
  const [vacancies, setVacancies] = useState<IVacancy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [analyticsData, vacanciesData] = await Promise.all([
          getAnalytics(),
          getVacancies({ limit: 5 })
        ])

        setAnalytics(analyticsData)
        setVacancies(vacanciesData.data)
        setError(null)
      } catch (err) {
        console.error('Failed to load data:', err)
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <section className="flex flex-col items-center justify-center relative py-16 px-5 md:px-8">
        <div className="text-[var(--text-primary)] font-mono animate-pulse">
          {'>'} Loading data...
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="flex flex-col items-center justify-center relative py-16 px-5 md:px-8">
        <div className="max-w-3xl w-full border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 rounded-lg">
          <div className="text-[var(--accent-pink)] font-mono mb-2">ERROR:</div>
          <div className="text-[var(--text-muted)] text-sm">{error}</div>
          <div className="text-[var(--text-muted)] text-xs mt-4">
            Убедитесь, что бэкенд запущен: <code className="text-[var(--accent-cyan)]">cd apps/scraper && bun dev</code>
          </div>
        </div>
      </section>
    )
  }

  if (!analytics) return null

  const {
    totalVacancies,
    remoteVacancies,
    averageSalaryFrom,
    averageSalaryTo,
    topSkills,
    lastScrapedAt,
    activeSources,
  } = analytics

  const remotePercent = totalVacancies > 0
    ? Math.round((remoteVacancies / totalVacancies) * 100)
    : 0

  return (
    <section className="flex flex-col items-center justify-start relative py-16 px-5 md:px-8">
      <div className="relative z-10 w-full max-w-5xl">
        {/* Section Title */}
        <h2 className="text-xl md:text-3xl font-bold text-center mb-12 neon-glow tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
          ДАННЫЕ В РЕАЛЬНОМ ВРЕМЕНИ
        </h2>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Live Stats */}
          <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 rounded-lg box-glow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[var(--text-primary)] font-bold">STATS:</div>
              <div className="text-[var(--text-muted)] text-xs">
                LAST UPDATE: {formatRelativeTime(lastScrapedAt)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-[var(--text-muted)] text-xs mb-1">{'>'} Vacancies:</div>
                <div className="text-[var(--text-primary)] font-mono text-2xl neon-glow">
                  {totalVacancies.toLocaleString('ru-RU')}
                </div>
              </div>

              <div>
                <div className="text-[var(--text-muted)] text-xs mb-1">{'>'} Remote:</div>
                <div className="text-[var(--accent-cyan)] font-mono text-2xl neon-glow">
                  {remoteVacancies.toLocaleString('ru-RU')}
                  <span className="text-sm ml-2">({remotePercent}%)</span>
                </div>
              </div>

              <div>
                <div className="text-[var(--text-muted)] text-xs mb-1">{'>'} Avg (from):</div>
                <div className="text-[var(--accent-green)] font-mono text-lg">
                  {averageSalaryFrom ? `${averageSalaryFrom.toLocaleString('ru-RU')} ₽` : 'N/A'}
                </div>
              </div>

              <div>
                <div className="text-[var(--text-muted)] text-xs mb-1">{'>'} Avg (to):</div>
                <div className="text-[var(--accent-green)] font-mono text-lg">
                  {averageSalaryTo ? `${averageSalaryTo.toLocaleString('ru-RU')} ₽` : 'N/A'}
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--border-color)] pt-3">
              <div className="text-[var(--text-muted)] text-xs">
                {'>'} Sources active: <span className="text-[var(--text-primary)]">{activeSources}/3</span>
              </div>
            </div>
          </div>

          {/* Top Skills */}
          <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 rounded-lg box-glow">
            <div className="text-[var(--text-primary)] font-bold mb-4">TRENDING SKILLS:</div>

            <div className="space-y-3">
              {topSkills.slice(0, 8).map(({ skill, count }) => {
                const maxCount = Math.max(...topSkills.map(s => s.count))
                const percentage = Math.round((count / maxCount) * 100)

                return (
                  <div key={skill}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[var(--text-secondary)] text-sm font-mono">{skill}</span>
                      <span className="text-[var(--text-muted)] text-xs">{count}</span>
                    </div>
                    <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--text-primary)] rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* === НОВЫЕ СЕКЦИИ (Phase 1: Quick Wins) === */}

        {/* AI Adoption & Seniority Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* AI/ML Adoption */}
          <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 rounded-lg box-glow">
            <div className="text-[var(--text-primary)] font-bold mb-4">AI/ML ADOPTION:</div>

            <div className="flex flex-col items-center justify-center py-6">
              <div className="text-6xl font-bold text-[var(--accent-pink)] neon-glow-pink mb-2">
                {analytics.aiAdoptionRate}%
              </div>
              <div className="text-[var(--text-muted)] text-sm font-mono">
                вакансий требуют AI/ML навыки
              </div>
            </div>

            <div className="border-t border-[var(--border-color)] pt-3 mt-4">
              <div className="text-[var(--text-muted)] text-xs">
                Трендовые технологии: GPT, ML, Neural Networks, Deep Learning
              </div>
            </div>
          </div>

          {/* Seniority Distribution */}
          <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 rounded-lg box-glow">
            <div className="text-[var(--text-primary)] font-bold mb-4">SENIORITY BREAKDOWN:</div>

            <div className="space-y-3">
              {analytics.seniorityDistribution?.slice(0, 5).map(({ level, count }) => {
                const maxCount = Math.max(...(analytics.seniorityDistribution || []).map(s => s.count))
                const percentage = Math.round((count / maxCount) * 100)

                return (
                  <div key={level}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[var(--text-secondary)] text-sm font-mono uppercase">{level}</span>
                      <span className="text-[var(--text-muted)] text-xs">{count}</span>
                    </div>
                    <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--text-secondary)] to-[var(--accent-cyan)] rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Top Tech Stack & Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Top Tech Stack */}
          <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 rounded-lg box-glow">
            <div className="text-[var(--text-primary)] font-bold mb-4">TOP TECH STACK:</div>

            <div className="flex flex-wrap gap-2">
              {analytics.topTechStack?.slice(0, 12).map(({ tech, count }) => (
                <div
                  key={tech}
                  className="px-3 py-1.5 border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-mono hover:border-[var(--accent-cyan)] transition-colors"
                >
                  <span className="text-[var(--text-secondary)]">{tech}</span>
                  <span className="text-[var(--text-muted)] ml-2">({count})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Benefits */}
          <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 rounded-lg box-glow">
            <div className="text-[var(--text-primary)] font-bold mb-4">POPULAR BENEFITS:</div>

            <div className="flex flex-wrap gap-2">
              {analytics.topBenefits?.slice(0, 10).map(({ benefit, count }) => (
                <div
                  key={benefit}
                  className="px-3 py-1.5 border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-mono hover:border-[var(--accent-green)] transition-colors"
                >
                  <span className="text-[var(--accent-green)]">{benefit}</span>
                  <span className="text-[var(--text-muted)] ml-2">({count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Work Format Distribution */}
        <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 rounded-lg box-glow mb-8">
          <div className="text-[var(--text-primary)] font-bold mb-4">WORK FORMAT DISTRIBUTION:</div>

          <div className="grid grid-cols-3 gap-4">
            {analytics.workFormatDistribution?.map(({ format, count }) => {
              const totalCount = (analytics.workFormatDistribution || []).reduce((sum, item) => sum + item.count, 0)
              const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0

              return (
                <div key={format} className="text-center">
                  <div className="text-3xl font-bold text-[var(--accent-cyan)] mb-2">
                    {percentage}%
                  </div>
                  <div className="text-[var(--text-secondary)] text-sm font-mono uppercase mb-1">
                    {format}
                  </div>
                  <div className="text-[var(--text-muted)] text-xs">
                    {count} вакансий
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Vacancies */}
        {vacancies.length > 0 && (
          <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 rounded-lg box-glow">
            <div className="text-[var(--text-primary)] font-bold mb-4">RECENT VACANCIES:</div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border-color)]">
                    <th className="pb-2 pr-4">Company</th>
                    <th className="pb-2 pr-4">Role</th>
                    <th className="pb-2 pr-4">Salary</th>
                    <th className="pb-2">Remote</th>
                  </tr>
                </thead>
                <tbody>
                  {vacancies.map(v => (
                    <tr key={v.id} className="border-b border-[var(--grid-color)] hover:bg-[var(--bg-primary)] transition-colors">
                      <td className="py-3 pr-4 text-[var(--text-secondary)]">
                        {(v.company || 'N/A').slice(0, 20)}
                      </td>
                      <td className="py-3 pr-4 text-[var(--text-primary)]">
                        <a href={v.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-cyan)] transition-colors underline">
                          {v.title.slice(0, 35)}
                        </a>
                      </td>
                      <td className="py-3 pr-4 text-[var(--accent-green)]">{formatSalary(v)}</td>
                      <td className="py-3">
                        {v.remote ? <span className="text-[var(--accent-cyan)]">🏠</span> : <span className="text-[var(--text-muted)]">🏢</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {vacancies.map(v => (
                <div key={v.id} className="border border-[var(--grid-color)] p-3 rounded bg-[var(--bg-primary)]">
                  <div className="flex items-start justify-between mb-2">
                    <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-[var(--text-primary)] text-sm font-semibold hover:text-[var(--accent-cyan)] underline">
                      {v.title.slice(0, 30)}
                    </a>
                    {v.remote ? <span className="text-[var(--accent-cyan)]">🏠</span> : <span className="text-[var(--text-muted)]">🏢</span>}
                  </div>
                  <div className="text-[var(--text-secondary)] text-xs mb-1">{v.company || 'N/A'}</div>
                  <div className="text-[var(--accent-green)] text-xs">{formatSalary(v)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
