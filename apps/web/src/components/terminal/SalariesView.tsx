import { motion } from 'framer-motion'
import type { BaseViewProps } from '@/types/terminal'
import { formatLargeNumber } from '@/lib/utils/formatters'
import { ProgressBar } from '@/lib/utils/terminal'

export default function SalariesView({ analytics, loading }: BaseViewProps) {
  if (loading || !analytics) {
    return (
      <div className="font-mono text-xs md:text-sm space-y-4">
        <div className="text-[var(--text-secondary)] pulse">
          [LOADING...] Анализ зарплат...
        </div>
      </div>
    )
  }

  const avgFrom = analytics.averageSalaryFrom
  const avgTo = analytics.averageSalaryTo
  const workFormats = analytics.workFormatDistribution || []
  const seniority = analytics.seniorityDistribution?.slice(0, 3) || []

  const totalWorkFormat = workFormats.reduce((sum, item) => sum + item.count, 0)
  const maxSeniorityCount = Math.max(...seniority.map(s => s.count), 1)

  return (
    <div className="font-mono text-xs md:text-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-[var(--text-secondary)] text-xs">[SALARIES]</span>
        <span className="text-[var(--accent-cyan)] neon-glow text-xs">MARKET</span>
      </div>

      {/* Big Salary Display */}
      <div className="border border-[var(--border-color)] p-4 bg-[var(--bg-secondary)] box-glow">
        <div className="text-[var(--text-muted)] text-[9px] mb-2">AVG_RANGE</div>
        <div className="flex items-baseline gap-2">
          {avgFrom && (
            <div className="text-2xl md:text-3xl font-bold text-[var(--accent-cyan)] neon-glow">
              {formatLargeNumber(Math.round(avgFrom))}
            </div>
          )}
          {avgFrom && avgTo && (
            <div className="text-xl md:text-2xl text-[var(--text-muted)]">–</div>
          )}
          {avgTo && (
            <div className="text-2xl md:text-3xl font-bold text-[var(--accent-cyan)] neon-glow">
              {formatLargeNumber(Math.round(avgTo))}
            </div>
          )}
          <div className="text-lg md:text-xl text-[var(--text-primary)]">₽</div>
        </div>
        {!avgFrom && !avgTo && (
          <div className="text-[var(--text-muted)]">Данные недоступны</div>
        )}
      </div>

      {/* Work Format Breakdown */}
      <div className="space-y-3">
        <div className="text-[var(--text-muted)] text-[9px]">WORK_FORMAT</div>
        {workFormats.map((format, index) => {
          const percentage = totalWorkFormat > 0 ? (format.count / totalWorkFormat) * 100 : 0
          return (
            <motion.div
              key={format.format}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-[var(--text-primary)] text-sm font-bold">
                  {percentage.toFixed(1)}%
                </span>
                <span className="text-[var(--text-secondary)] text-xs">
                  {format.format.toUpperCase()}
                </span>
              </div>
              <span className="text-[var(--text-muted)] text-[9px]">
                {formatLargeNumber(format.count)}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Seniority Breakdown */}
      {seniority.length > 0 && (
        <div className="space-y-3">
          <div className="text-[var(--text-muted)] text-[9px]">SENIORITY_TOP3</div>
          {seniority.map((level, index) => {
            const percentage = maxSeniorityCount > 0 ? (level.count / maxSeniorityCount) * 100 : 0
            return (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-primary)]">{level.level}</span>
                  <span className="text-[var(--text-muted)] text-[9px]">
                    {formatLargeNumber(level.count)}
                  </span>
                </div>
                <div className="relative h-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)]">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-[var(--text-secondary)] to-[var(--accent-cyan)]"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
