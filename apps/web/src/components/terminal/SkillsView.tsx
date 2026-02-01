'use client'
import { motion } from 'framer-motion'
import type { BaseViewProps } from '@/types/terminal'
import { formatLargeNumber } from '@/lib/utils/formatters'
import { Card, Heading, Text } from '@/components/ui'

export default function SkillsView({ analytics, loading }: BaseViewProps) {
  if (loading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-background-secondary rounded-card animate-pulse"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-20 bg-background-secondary rounded-card animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  const hasTechStackDetailed = analytics.techStackDetailed && analytics.techStackDetailed.length > 0
  const topTech = hasTechStackDetailed
    ? analytics.techStackDetailed.slice(0, 15)
    : analytics.topTechStack?.slice(0, 12) || []
  const aiAdoption = analytics.aiAdoptionByCategory?.slice(0, 5) || []

  const maxTechCount = Math.max(...topTech.map((t: any) => t.count), 1)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  }

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.25 } }
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
          Технологический стек
        </Heading>
        <Text size="sm" color="secondary" className="mt-2">
          Самые востребованные технологии на рынке
        </Text>
      </motion.div>

      {/* Top Technologies - Tag Cloud */}
      {topTech.length > 0 && (
        <motion.div variants={item}>
          <Card variant="default" padding="lg">
            <Heading level="h3" weight="medium" color="primary" className="mb-6 uppercase tracking-wide">
              Топ технологии
            </Heading>
            <div className="flex flex-wrap gap-3 justify-center">
              {topTech.map((tech: any, index: number) => {
                const techName = hasTechStackDetailed ? tech.name : tech.tech
                const percentage = maxTechCount > 0 ? (tech.count / maxTechCount) * 100 : 0
                const sizeClass = percentage > 70 ? 'text-2xl' : percentage > 50 ? 'text-xl' : percentage > 30 ? 'text-lg' : 'text-base'

                return (
                  <motion.div
                    key={techName}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Card
                      variant="bordered"
                      padding="sm"
                      className="cursor-default hover:border-accent-primary hover:bg-background-tertiary transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <Text
                          size={index < 5 ? 'lg' : 'base'}
                          weight={index < 5 ? 'bold' : 'medium'}
                          color="primary"
                          className={sizeClass}
                        >
                          {techName}
                        </Text>
                        <Text
                          size="xs"
                          color={index < 5 ? 'accent' : 'secondary'}
                          className="font-medium"
                        >
                          {formatLargeNumber(tech.count)}
                        </Text>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* AI Adoption */}
      {aiAdoption.length > 0 && (
        <motion.div variants={item}>
          <Heading level="h3" weight="medium" color="primary" className="mb-4 uppercase tracking-wide">
            AI & Machine Learning по категориям
          </Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiAdoption.map((cat: any, index: number) => {
              const adoptionPercent = analytics.totalVacancies > 0
                ? (cat.count / analytics.totalVacancies) * 100
                : 0

              return (
                <motion.div
                  key={cat.category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.3 }}
                >
                  <Card variant="default" padding="lg" hover="lift">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Text size="sm" weight="bold" color="primary" className="uppercase">
                          {cat.category}
                        </Text>
                        <Text size="lg" weight="bold" color="accent" className="font-medium">
                          {adoptionPercent.toFixed(1)}%
                        </Text>
                      </div>

                      <div className="space-y-1">
                        <div className="w-full bg-background-tertiary rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-accent-primary transition-all duration-500"
                            style={{ width: `${Math.min(adoptionPercent, 100)}%` }}
                          />
                        </div>
                        <Text size="xs" color="secondary">
                          {formatLargeNumber(cat.count)} вакансий с AI требованиями
                        </Text>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Summary */}
      {topTech.length > 0 && (
        <motion.div variants={item}>
          <Card variant="blur" padding="lg">
            <div className="text-center space-y-2">
              <Text size="lg" weight="bold" color="primary">
                Всего технологий: {topTech.length}
              </Text>
              <Text size="sm" color="secondary">
                Анализируем {formatLargeNumber(analytics.totalVacancies)} вакансий для определения трендов
              </Text>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
