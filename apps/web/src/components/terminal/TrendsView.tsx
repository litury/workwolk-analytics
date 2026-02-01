'use client'
import { motion } from 'framer-motion'
import type { BaseViewProps } from '@/types/terminal'
import { formatLargeNumber } from '@/lib/utils/formatters'
import { Card, Heading, Text } from '@/components/ui'

export default function TrendsView({ analytics, loading }: BaseViewProps) {
  if (loading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-background-secondary rounded-card animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-background-secondary rounded-card animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  const topSkills = analytics.topSkills?.slice(0, 5) || []
  const workFormats = analytics.workFormatDistribution || []
  const seniority = analytics.seniorityDistribution || []

  const remoteFormat = workFormats.find(f =>
    f.format.toLowerCase().includes('remote') || f.format.toLowerCase().includes('удален')
  )
  const totalFormats = workFormats.reduce((sum, f) => sum + f.count, 0)
  const remotePercent = remoteFormat && totalFormats > 0
    ? (remoteFormat.count / totalFormats) * 100
    : 0

  const topSeniority = seniority.length > 0
    ? seniority.reduce((prev, current) => (prev.count > current.count ? prev : current))
    : null

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={item}>
        <Heading level="h2" weight="bold" color="primary" className="uppercase tracking-wide">
          Рыночные тренды
        </Heading>
        <Text size="sm" color="secondary" className="mt-2">
          Ключевые направления развития IT рынка
        </Text>
      </motion.div>

      {/* Key Trends Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI Adoption */}
        <Card variant="default" padding="lg" hover="glow">
          <div className="space-y-4">
            <Text size="xs" color="secondary" className="uppercase tracking-wide">
              AI Adoption Rate
            </Text>
            <div className="text-center">
              <div className="text-5xl font-bold text-accent-primary">
                {analytics.aiAdoptionRate || 0}%
              </div>
              <Text size="xs" color="tertiary" className="mt-2">
                вакансий требуют AI навыки
              </Text>
            </div>
            <div className="w-full bg-background-tertiary rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-accent-primary transition-all duration-1000"
                style={{ width: `${Math.min(analytics.aiAdoptionRate || 0, 100)}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Remote Work */}
        <Card variant="default" padding="lg" hover="glow">
          <div className="space-y-4">
            <Text size="xs" color="secondary" className="uppercase tracking-wide">
              Remote Work Trend
            </Text>
            <div className="text-center">
              <div className="text-5xl font-bold text-text-primary">
                {remotePercent.toFixed(0)}%
              </div>
              <Text size="xs" color="tertiary" className="mt-2">
                удалённых вакансий
              </Text>
            </div>
            <div className="w-full bg-background-tertiary rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-text-primary transition-all duration-1000"
                style={{ width: `${Math.min(remotePercent, 100)}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Top Seniority */}
        {topSeniority && (
          <Card variant="default" padding="lg" hover="glow">
            <div className="space-y-4">
              <Text size="xs" color="secondary" className="uppercase tracking-wide">
                Most Demanded Level
              </Text>
              <div className="text-center">
                <Heading level="h3" color="primary" className="uppercase">
                  {topSeniority.level}
                </Heading>
                <Text size="xs" color="tertiary" className="mt-2">
                  {formatLargeNumber(topSeniority.count)} вакансий
                </Text>
              </div>
              <div className="w-full bg-background-tertiary rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-accent-secondary transition-all duration-1000"
                  style={{
                    width: `${Math.min((topSeniority.count / analytics.totalVacancies) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          </Card>
        )}
      </motion.div>

      {/* Top Growing Skills */}
      {topSkills.length > 0 && (
        <motion.div variants={item}>
          <Heading level="h3" weight="medium" color="primary" className="mb-4 uppercase tracking-wide">
            Топ растущие навыки
          </Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topSkills.map((skill, index) => (
              <Card key={skill.skill} variant="default" padding="lg" hover="lift">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-xl font-bold text-accent-primary">
                        #{index + 1}
                      </div>
                      <Text size="base" weight="bold" color="primary">
                        {skill.skill}
                      </Text>
                    </div>
                    <Text size="xs" color="secondary">
                      {formatLargeNumber(skill.count)} вакансий
                    </Text>
                  </div>
                  <div className="text-3xl">📈</div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Work Format Distribution */}
      {workFormats.length > 0 && (
        <motion.div variants={item}>
          <Card variant="blur" padding="lg">
            <Heading level="h3" weight="medium" color="primary" className="mb-4 uppercase tracking-wide text-center">
              Распределение форматов работы
            </Heading>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {workFormats.slice(0, 3).map((format) => {
                const percent = totalFormats > 0
                  ? (format.count / totalFormats) * 100
                  : 0

                return (
                  <div key={format.format} className="text-center space-y-2">
                    <Text size="sm" color="secondary" className="uppercase">
                      {format.format || 'Другое'}
                    </Text>
                    <div className="text-4xl font-bold text-accent-primary">
                      {percent.toFixed(0)}%
                    </div>
                    <Text size="xs" color="tertiary">
                      {formatLargeNumber(format.count)} вакансий
                    </Text>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
