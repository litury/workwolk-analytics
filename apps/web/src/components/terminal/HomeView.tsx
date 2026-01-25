'use client'
import { motion } from 'framer-motion'
import type { BaseViewProps } from '@/types/terminal'
import { formatLargeNumber, formatRelativeTime } from '@/lib/utils/formatters'

export default function HomeView({ analytics, loading }: BaseViewProps) {
  if (loading) {
    return (
      <div className="font-mono text-xs md:text-sm space-y-6">
        <div className="h-8 bg-[var(--bg-secondary)] pulse w-48"></div>
        <div className="h-32 bg-[var(--bg-secondary)] pulse"></div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-[var(--bg-secondary)] pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  // Всегда используем topSkills на главной (базовые данные из всех вакансий)
  const topSkills = analytics?.topSkills?.slice(0, 10) || []

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="font-mono text-xs md:text-sm space-y-8"
    >
      {/* Hero Section - Крупный ASCII Logo */}
      <motion.div variants={item} className="text-center py-6 md:py-8">
        <pre className="text-[var(--accent-cyan)] neon-glow text-[8px] md:text-xs leading-none md:leading-tight overflow-x-auto">
{`██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗██╗    ██╗ ██████╗ ██╗     ██╗  ██╗
██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝██║    ██║██╔═══██╗██║     ██║ ██╔╝
██║ █╗ ██║██║   ██║██████╔╝█████╔╝ ██║ █╗ ██║██║   ██║██║     █████╔╝
██║███╗██║██║   ██║██╔══██╗██╔═██╗ ██║███╗██║██║   ██║██║     ██╔═██╗
╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗╚███╔███╔╝╚██████╔╝███████╗██║  ██╗
 ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚══╝╚══╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝`}
        </pre>
        <div className="mt-4 text-[var(--text-muted)] text-xs md:text-sm">
          АГРЕГАТОР ДАННЫХ IT РЫНКА
        </div>
      </motion.div>

      {/* Top Skills Section - базовые данные из всех вакансий */}
      <motion.div variants={item}>
        <div className="text-[var(--text-muted)] text-[9px] mb-3 text-center">
          TOP SKILLS
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {topSkills.map((skill: any, index: number) => (
            <motion.div
              key={skill.skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="px-3 py-2 border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--accent-cyan)] hover:box-glow transition-all"
            >
              <span className="text-[var(--text-primary)] text-xs">{skill.skill}</span>
              <span className="text-[var(--text-muted)] ml-2 text-[9px]">
                ({formatLargeNumber(skill.count)})
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-[var(--border-color)] p-3 bg-[var(--bg-secondary)]">
            <div className="text-[var(--text-muted)] text-[9px] mb-1">TOTAL</div>
            <div className="text-2xl md:text-3xl text-[var(--accent-cyan)] neon-glow">
              {formatLargeNumber(analytics?.totalVacancies || 0)}
            </div>
          </div>

          <div className="border border-[var(--border-color)] p-3 bg-[var(--bg-secondary)]">
            <div className="text-[var(--text-muted)] text-[9px] mb-1">REMOTE</div>
            <div className="text-2xl md:text-3xl text-[var(--text-secondary)] neon-glow">
              {analytics ? Math.round((analytics.remoteVacancies / analytics.totalVacancies) * 100) : 0}%
            </div>
          </div>

          <div className="border border-[var(--border-color)] p-3 bg-[var(--bg-secondary)]">
            <div className="text-[var(--text-muted)] text-[9px] mb-1">SOURCES</div>
            <div className="text-2xl md:text-3xl text-[var(--text-primary)]">
              <span className="pulse mr-2">●</span>
              {analytics?.activeSources || 0}/3
            </div>
          </div>

          <div className="border border-[var(--border-color)] p-3 bg-[var(--bg-secondary)]">
            <div className="text-[var(--text-muted)] text-[9px] mb-1">SYNC</div>
            <div className="text-sm text-[var(--text-primary)]">
              {analytics?.lastScrapedAt ? formatRelativeTime(analytics.lastScrapedAt) : 'N/A'}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
