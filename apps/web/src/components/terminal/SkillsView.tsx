import { motion } from 'framer-motion'
import type { BaseViewProps } from '@/types/terminal'
import { formatLargeNumber } from '@/lib/utils/formatters'

export default function SkillsView({ analytics, loading }: BaseViewProps) {
  if (loading || !analytics) {
    return (
      <div className="font-mono text-xs md:text-sm space-y-4">
        <div className="text-[var(--text-secondary)] pulse">
          [LOADING...] Сканирование навыков...
        </div>
      </div>
    )
  }

  const topSkills = analytics.topSkills?.slice(0, 5) || []
  const topTech = analytics.topTechStack?.slice(0, 8) || []
  const topBenefits = analytics.topBenefits?.slice(0, 6) || []

  const maxSkillCount = Math.max(...topSkills.map(s => s.count), 1)

  return (
    <div className="font-mono text-xs md:text-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-[var(--text-secondary)] text-xs">[SKILLS]</span>
        <span className="text-[var(--accent-cyan)] neon-glow text-xs">SCAN</span>
      </div>

      {/* Section 1: Hot Skills with Bars */}
      <div className="space-y-3">
        <div className="text-[var(--text-muted)] text-[9px]">TOP_5</div>
        {topSkills.map((skill, index) => {
          const percentage = maxSkillCount > 0 ? (skill.count / maxSkillCount) * 100 : 0
          return (
            <motion.div
              key={skill.skill}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-primary)]">{skill.skill}</span>
                <span className="text-[var(--text-muted)] text-[9px]">
                  {formatLargeNumber(skill.count)}
                </span>
              </div>
              <div className="relative h-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--text-secondary)]"
                  style={{ width: `${percentage}%`, willChange: 'width' }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Section 2: Tech Stack Badges */}
      <div className="space-y-3">
        <div className="text-[var(--text-muted)] text-[9px]">TECH_STACK</div>
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          }}
          initial="hidden"
          animate="show"
          className="flex flex-wrap gap-2"
        >
          {topTech.map((tech) => (
            <motion.div
              key={tech.tech}
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                show: { opacity: 1, scale: 1 }
              }}
              style={{ willChange: 'transform, opacity' }}
              className="px-2 py-1 border border-[var(--border-color)] hover:border-[var(--accent-cyan)] hover:box-glow transition-all cursor-default text-xs"
            >
              <span className="text-[var(--text-primary)]">{tech.tech}</span>
              <span className="text-[var(--text-muted)] ml-1 text-[9px]">({tech.count})</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Section 3: Benefits Badges */}
      <div className="space-y-3">
        <div className="text-[var(--text-muted)] text-[9px]">BENEFITS</div>
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          }}
          initial="hidden"
          animate="show"
          className="flex flex-wrap gap-2"
        >
          {topBenefits.map((benefit) => (
            <motion.div
              key={benefit.benefit}
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                show: { opacity: 1, scale: 1 }
              }}
              style={{ willChange: 'transform, opacity' }}
              className="px-2 py-1 border border-[var(--border-color)] hover:border-[var(--text-secondary)] hover:box-glow transition-all cursor-default text-xs"
            >
              <span className="text-[var(--text-primary)]">{benefit.benefit}</span>
              <span className="text-[var(--text-muted)] ml-1 text-[9px]">({benefit.count})</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
