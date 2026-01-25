import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'
import type { BaseViewProps } from '@/types/terminal'
import { formatLargeNumber } from '@/lib/utils/formatters'
import { ProgressBar } from '@/lib/utils/terminal'

export default function TrendsView({ analytics, loading }: BaseViewProps) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))

  useEffect(() => {
    if (analytics?.aiAdoptionRate) {
      const animation = animate(count, analytics.aiAdoptionRate, {
        duration: 2,
        ease: "easeOut"
      })
      return animation.stop
    }
  }, [analytics?.aiAdoptionRate, count])

  if (loading || !analytics) {
    return (
      <div className="font-mono text-xs md:text-sm space-y-4">
        <div className="text-[var(--text-secondary)] pulse">
          [LOADING...] Анализ трендов...
        </div>
      </div>
    )
  }

  const topSkills = analytics.topSkills?.slice(0, 3) || []
  const workFormats = analytics.workFormatDistribution || []
  const seniority = analytics.seniorityDistribution || []

  const remoteFormat = workFormats.find(f => f.format.toLowerCase().includes('remote') || f.format.toLowerCase().includes('удален'))
  const totalFormats = workFormats.reduce((sum, f) => sum + f.count, 0)
  const remotePercent = remoteFormat && totalFormats > 0 ? (remoteFormat.count / totalFormats) * 100 : 0

  const topSeniority = seniority.length > 0
    ? seniority.reduce((prev, current) => (prev.count > current.count ? prev : current))
    : null

  const avgFrom = analytics.averageSalaryFrom
  const avgTo = analytics.averageSalaryTo

  return (
    <div className="font-mono text-xs md:text-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-[var(--text-secondary)] text-xs">[TRENDS]</span>
        <span className="text-[var(--accent-cyan)] neon-glow text-xs">ANALYSIS</span>
      </div>

      {/* Hero Metric: AI Adoption */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="border border-[var(--border-color)] p-4 bg-[var(--bg-secondary)] box-glow text-center"
      >
        <div className="text-[var(--text-muted)] text-[9px] mb-2">AI/ML_ADOPTION</div>
        <motion.div className="text-4xl md:text-5xl font-bold text-[var(--accent-pink)] neon-glow-pink mb-2">
          {rounded.get().toFixed(1)}%
        </motion.div>
        <div className="text-[var(--text-muted)] text-[9px]">
          GPT • ML • Neural Networks
        </div>
      </motion.div>

      {/* Remote Work Trend */}
      <div className="space-y-2">
        <div className="text-[var(--text-muted)] text-[9px]">REMOTE_TREND</div>
        <div className="border border-[var(--border-color)] p-3 bg-[var(--bg-secondary)]">
          <div className="flex items-center justify-between">
            <div className="text-xl md:text-2xl font-bold text-[var(--text-secondary)] neon-glow">
              {remotePercent.toFixed(1)}%
            </div>
            <div className="text-[var(--text-secondary)] text-sm">
              {remotePercent > 35 ? '↑ GROWING' : remotePercent > 25 ? '→ STABLE' : '↓ DECLINING'}
            </div>
          </div>
        </div>
      </div>

      {/* Hot Skills This Month */}
      <div className="space-y-2">
        <div className="text-[var(--text-muted)] text-[9px]">TOP_3_SKILLS</div>
        <div className="space-y-2">
          {topSkills.map((skill, index) => (
            <motion.div
              key={skill.skill}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between border-l-2 border-[var(--accent-cyan)] pl-3 py-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-[var(--accent-cyan)] text-[9px]">↑</span>
                <span className="text-[var(--text-primary)] text-xs">{skill.skill}</span>
              </div>
              <span className="text-[var(--text-muted)] text-[9px]">
                {formatLargeNumber(skill.count)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Market Insights */}
      <div className="space-y-2">
        <div className="text-[var(--text-muted)] text-[9px]">INSIGHTS</div>
        <div className="grid grid-cols-2 gap-2">
          {/* Salary Trend */}
          <div className="border border-[var(--border-color)] p-2 bg-[var(--bg-secondary)]">
            <div className="text-[var(--text-muted)] text-[8px] mb-1">AVG_SALARY</div>
            {avgFrom && avgTo ? (
              <div className="text-xs text-[var(--accent-cyan)]">
                {formatLargeNumber(Math.round(avgFrom))} – {formatLargeNumber(Math.round(avgTo))} ₽
              </div>
            ) : (
              <div className="text-[var(--text-muted)] text-[9px]">N/A</div>
            )}
          </div>

          {/* Seniority Demand */}
          <div className="border border-[var(--border-color)] p-2 bg-[var(--bg-secondary)]">
            <div className="text-[var(--text-muted)] text-[8px] mb-1">TOP_LEVEL</div>
            {topSeniority ? (
              <div>
                <div className="text-xs text-[var(--text-secondary)]">
                  {topSeniority.level}
                </div>
              </div>
            ) : (
              <div className="text-[var(--text-muted)] text-[9px]">N/A</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
