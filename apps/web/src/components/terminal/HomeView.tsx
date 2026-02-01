'use client'
import { motion } from 'framer-motion'
import type { BaseViewProps } from '@/types/terminal'
import { formatLargeNumber, formatRelativeTime } from '@/lib/utils/formatters'
import { Card, Heading, Text } from '@/components/ui'

export default function HomeView({ analytics, loading }: BaseViewProps) {
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-24 bg-background-secondary rounded-card animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-background-secondary rounded-card animate-pulse"></div>
          ))}
        </div>
        <div className="h-48 bg-background-secondary rounded-card animate-pulse"></div>
      </div>
    )
  }

  const topSkills = analytics?.topSkills?.slice(0, 12) || []

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12"
    >
      {/* Hero Section - Minimalist */}
      <motion.div variants={item} className="text-center py-12">
        <Heading
          level="h1"
          weight="bold"
          color="primary"
          className="text-5xl md:text-6xl mb-4"
        >
          IT ANALYTICS
        </Heading>
        <Text
          size="lg"
          color="secondary"
          className="uppercase tracking-wide"
        >
          Аналитика IT рынка в реальном времени
        </Text>
      </motion.div>

      {/* Key Metrics Grid */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card
          variant="default"
          padding="lg"
          hover="lift"
          className="text-center"
        >
          <Text size="xs" color="secondary" className="uppercase tracking-wide mb-2">
            Всего вакансий
          </Text>
          <div className="text-4xl font-bold text-accent-primary">
            {formatLargeNumber(analytics?.totalVacancies || 0)}
          </div>
        </Card>

        <Card
          variant="default"
          padding="lg"
          hover="lift"
          className="text-center"
        >
          <Text size="xs" color="secondary" className="uppercase tracking-wide mb-2">
            Удалённая работа
          </Text>
          <div className="text-4xl font-bold text-text-primary">
            {analytics ? Math.round((analytics.remoteVacancies / analytics.totalVacancies) * 100) : 0}%
          </div>
        </Card>

        <Card
          variant="default"
          padding="lg"
          hover="lift"
          className="text-center"
        >
          <Text size="xs" color="secondary" className="uppercase tracking-wide mb-2">
            Активные источники
          </Text>
          <div className="text-4xl font-bold text-text-primary">
            {analytics?.activeSources || 0}<Text as="span" size="xl" color="tertiary">/3</Text>
          </div>
        </Card>

        <Card
          variant="default"
          padding="lg"
          hover="lift"
          className="text-center"
        >
          <Text size="xs" color="secondary" className="uppercase tracking-wide mb-2">
            Последнее обновление
          </Text>
          <div className="text-lg font-medium text-text-primary pt-2">
            {analytics?.lastScrapedAt ? formatRelativeTime(analytics.lastScrapedAt) : 'N/A'}
          </div>
        </Card>
      </motion.div>

      {/* Top Skills - Tag Cloud */}
      <motion.div variants={item}>
        <Heading
          level="h3"
          weight="medium"
          color="primary"
          className="mb-6 uppercase tracking-wide text-center"
        >
          Топ навыки
        </Heading>
        <div className="flex flex-wrap gap-3 justify-center">
          {topSkills.map((skill: any, index: number) => (
            <motion.div
              key={skill.skill}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.05, duration: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card
                variant="bordered"
                padding="sm"
                className="cursor-default hover:border-accent-primary transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <Text size="sm" weight="medium" color="primary">
                    {skill.skill}
                  </Text>
                  <Text size="xs" color="accent" className="font-medium">
                    {formatLargeNumber(skill.count)}
                  </Text>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Additional Info */}
      <motion.div variants={item}>
        <Card variant="blur" padding="lg">
          <div className="text-center">
            <Text size="sm" color="secondary">
              Данные обновляются автоматически каждые 24 часа из ведущих IT job-платформ
            </Text>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
