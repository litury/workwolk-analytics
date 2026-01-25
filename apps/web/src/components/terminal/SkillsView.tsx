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

  // Используем enriched tech stack если есть, иначе fallback на topSkills
  const hasTechStackDetailed = analytics.techStackDetailed && analytics.techStackDetailed.length > 0
  const topTech = hasTechStackDetailed
    ? analytics.techStackDetailed.slice(0, 12)
    : analytics.topTechStack?.slice(0, 8) || []
  const topBenefits = analytics.topBenefits?.slice(0, 6) || []
  const aiAdoption = analytics.aiAdoptionByCategory?.slice(0, 5) || []
  const jobTags = analytics.topJobTags?.slice(0, 10) || []

  const maxTechCount = Math.max(...topTech.map((t: any) => t.count), 1)

  return (
    <div className="font-mono text-xs md:text-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-[var(--text-secondary)] text-xs">[TECH STACK]</span>
        <span className="text-[var(--accent-cyan)] neon-glow text-xs">ANALYSIS</span>
      </div>

      {/* Section 1: Top Tech with Bars */}
      <div className="space-y-3">
        <div className="text-[var(--text-muted)] text-[9px]">
          {hasTechStackDetailed ? 'TOP_12_DETAILED' : 'TOP_8'}
        </div>
        {topTech.map((tech: any, index: number) => {
          const techName = hasTechStackDetailed ? tech.name : tech.tech
          const percentage = maxTechCount > 0 ? (tech.count / maxTechCount) * 100 : 0
          return (
            <motion.div
              key={techName}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-primary)]">{techName}</span>
                  {hasTechStackDetailed && tech.category && (
                    <span className="text-[var(--text-muted)] text-[8px] px-1 border border-[var(--border-color)]">
                      {tech.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-muted)] text-[9px]">
                    {formatLargeNumber(tech.count)}
                  </span>
                  {hasTechStackDetailed && tech.requiredPercent > 0 && (
                    <span className="text-[var(--accent-cyan)] text-[8px]">
                      {tech.requiredPercent}% req
                    </span>
                  )}
                </div>
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

      {/* Section 2: AI Adoption by Category */}
      {aiAdoption.length > 0 && (
        <div className="space-y-3">
          <div className="text-[var(--text-muted)] text-[9px]">AI_ADOPTION</div>
          <div className="space-y-2">
            {aiAdoption.map((cat: any) => (
              <div key={cat.category} className="flex items-center justify-between text-xs border-l-2 border-[var(--text-secondary)] pl-3 py-1">
                <span className="text-[var(--text-primary)] uppercase">{cat.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-muted)] text-[9px]">{cat.aiJobs}/{cat.total}</span>
                  <span className="text-[var(--text-secondary)] font-bold">{cat.aiPercentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Job Tags */}
      {jobTags.length > 0 && (
        <div className="space-y-3">
          <div className="text-[var(--text-muted)] text-[9px]">JOB_TAGS</div>
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
            {jobTags.map((tag) => (
              <motion.div
                key={tag.tag}
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  show: { opacity: 1, scale: 1 }
                }}
                style={{ willChange: 'transform, opacity' }}
                className="px-2 py-1 border border-[var(--border-color)] hover:border-[var(--accent-cyan)] hover:box-glow transition-all cursor-default text-xs"
              >
                <span className="text-[var(--accent-cyan)]">#{tag.tag}</span>
                <span className="text-[var(--text-muted)] ml-1 text-[9px]">({tag.count})</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Section 4: Benefits Badges */}
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
