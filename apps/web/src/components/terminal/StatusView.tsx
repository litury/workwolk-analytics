'use client'
import { motion } from 'framer-motion'
import type { StatusViewProps } from '@/types/terminal'
import { formatRelativeTime, formatLargeNumber, formatPercentage } from '@/lib/utils/formatters'
import { Card, Heading, Text } from '@/components/ui'

// Simple progress bar component
function ProgressBar({ value, max, className = '' }: { value: number; max: number; className?: string }) {
  const percent = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="w-full bg-background-tertiary rounded-full h-2 overflow-hidden">
      <div
        className={`h-full bg-accent-primary transition-all duration-500 ${className}`}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  )
}

export default function StatusView({ analytics, loading, error }: StatusViewProps) {
  if (error) {
    return (
      <Card variant="bordered" padding="lg" className="border-red-500">
        <div className="text-center space-y-4">
          <Heading level="h3" color="primary">Ошибка загрузки данных</Heading>
          <Text color="secondary">{error}</Text>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-accent-primary text-white rounded-button hover:bg-accent-secondary transition-all duration-200"
          >
            Обновить страницу
          </button>
        </div>
      </Card>
    )
  }

  if (loading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-background-secondary rounded-card animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-background-secondary rounded-card animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

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
          Системная аналитика
        </Heading>
        <Text size="sm" color="secondary" className="mt-2">
          Последнее обновление: {formatRelativeTime(analytics.lastScrapedAt)}
        </Text>
      </motion.div>

      {/* Status Cards */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card variant="default" padding="lg" hover="glow">
          <Text size="xs" color="secondary" className="uppercase tracking-wide mb-3">
            База данных
          </Text>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-accent-primary">
              {formatLargeNumber(analytics.totalVacancies)}
            </div>
            <Text size="xs" color="tertiary">записей</Text>
          </div>
        </Card>

        <Card variant="default" padding="lg" hover="glow">
          <Text size="xs" color="secondary" className="uppercase tracking-wide mb-3">
            Удалённая работа
          </Text>
          <div className="text-3xl font-bold text-text-primary">
            {formatPercentage(analytics.remoteVacancies, analytics.totalVacancies)}
          </div>
        </Card>

        <Card variant="default" padding="lg" hover="glow">
          <Text size="xs" color="secondary" className="uppercase tracking-wide mb-3">
            Активные источники
          </Text>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></div>
            <div className="text-3xl font-bold text-text-primary">
              {analytics.activeSources}<Text as="span" size="lg" color="tertiary">/3</Text>
            </div>
          </div>
        </Card>

        <Card variant="default" padding="lg" hover="glow">
          <Text size="xs" color="secondary" className="uppercase tracking-wide mb-3">
            Статус синхронизации
          </Text>
          <Text size="base" weight="medium" color="primary" className="pt-1">
            {formatRelativeTime(analytics.lastScrapedAt)}
          </Text>
        </Card>
      </motion.div>

      {/* Job Categories */}
      {analytics.categoryDistribution && analytics.categoryDistribution.length > 0 && (
        <motion.div variants={item}>
          <Card variant="default" padding="lg">
            <Heading level="h3" weight="medium" color="primary" className="mb-6 uppercase tracking-wide">
              Категории вакансий
            </Heading>
            <div className="space-y-4">
              {analytics.categoryDistribution.slice(0, 5).map((cat) => {
                const percent = analytics.totalVacancies > 0
                  ? (cat.count / analytics.totalVacancies) * 100
                  : 0
                return (
                  <div key={cat.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Text size="sm" weight="medium" color="primary" className="uppercase">
                        {cat.category}
                      </Text>
                      <div className="flex items-center gap-4">
                        <Text size="xs" color="secondary">
                          {formatLargeNumber(cat.count)} вакансий
                        </Text>
                        {cat.avgMinSalary > 0 && (
                          <Text size="xs" color="accent" className="font-medium">
                            {Math.round(cat.avgMinSalary / 1000)}-{Math.round(cat.avgMaxSalary / 1000)}K ₽
                          </Text>
                        )}
                      </div>
                    </div>
                    <ProgressBar value={cat.count} max={analytics.totalVacancies} />
                    <Text size="xs" color="tertiary">
                      {percent.toFixed(1)}% от всех вакансий
                    </Text>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Work Format Distribution */}
      {analytics.workFormatDistribution && analytics.workFormatDistribution.length > 0 && (
        <motion.div variants={item}>
          <Heading level="h3" weight="medium" color="primary" className="mb-4 uppercase tracking-wide">
            Формат работы
          </Heading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics.workFormatDistribution.map((format) => {
              const percent = analytics.totalVacancies > 0
                ? (format.count / analytics.totalVacancies) * 100
                : 0
              return (
                <Card key={format.format} variant="default" padding="lg" hover="lift">
                  <Text size="xs" color="secondary" className="uppercase tracking-wide mb-2">
                    {format.format || 'Другое'}
                  </Text>
                  <div className="flex items-baseline gap-2 mb-3">
                    <div className="text-3xl font-bold text-accent-primary">{percent.toFixed(0)}%</div>
                    <Text size="xs" color="tertiary">({formatLargeNumber(format.count)})</Text>
                  </div>
                  <ProgressBar value={format.count} max={analytics.totalVacancies} />
                </Card>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Contract Type Distribution */}
      {analytics.contractTypeDistribution && analytics.contractTypeDistribution.length > 0 && (
        <motion.div variants={item}>
          <Heading level="h3" weight="medium" color="primary" className="mb-4 uppercase tracking-wide">
            Тип контракта
          </Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.contractTypeDistribution.map((contract) => {
              const percent = analytics.totalVacancies > 0
                ? (contract.count / analytics.totalVacancies) * 100
                : 0
              return (
                <Card key={contract.type} variant="default" padding="lg" hover="lift">
                  <Text size="xs" color="secondary" className="uppercase tracking-wide mb-2">
                    {contract.type}
                  </Text>
                  <div className="flex items-baseline gap-2 mb-3">
                    <div className="text-3xl font-bold text-text-primary">{percent.toFixed(0)}%</div>
                    <Text size="xs" color="tertiary">({formatLargeNumber(contract.count)})</Text>
                  </div>
                  <ProgressBar value={contract.count} max={analytics.totalVacancies} />
                </Card>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Company Size Distribution */}
      {analytics.companySizeDistribution && analytics.companySizeDistribution.length > 0 && (
        <motion.div variants={item}>
          <Card variant="default" padding="lg">
            <Heading level="h3" weight="medium" color="primary" className="mb-6 uppercase tracking-wide">
              Размер компаний
            </Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.companySizeDistribution.map((size) => {
                const percent = analytics.totalVacancies > 0
                  ? (size.count / analytics.totalVacancies) * 100
                  : 0
                return (
                  <div key={size.size} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Text size="sm" weight="medium" color="primary" className="uppercase">
                        {size.size}
                      </Text>
                      <Text size="xs" color="secondary">
                        {formatLargeNumber(size.count)} ({percent.toFixed(1)}%)
                      </Text>
                    </div>
                    <ProgressBar value={size.count} max={analytics.totalVacancies} />
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
