'use client'
import { motion } from 'framer-motion'
import type { BaseViewProps } from '@/types/terminal'
import { formatLargeNumber } from '@/lib/utils/formatters'
import { Card, Heading, Text } from '@/components/ui'

const SENIORITY_LABELS: Record<string, string> = {
  'junior': 'Junior',
  'middle': 'Middle',
  'senior': 'Senior',
  'lead': 'Team Lead',
  'principal': 'Principal',
}

export default function SalariesView({ analytics, loading }: BaseViewProps) {
  if (loading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-background-secondary rounded-card animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-background-secondary rounded-card animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  const salaryData = analytics.salaryBySeniority || []
  const hasData = salaryData.length > 0
  const topCompanies = analytics.topCompanies?.slice(0, 5) || []

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
          Зарплатная аналитика
        </Heading>
        <Text size="sm" color="secondary" className="mt-2">
          Средние зарплаты по уровням
        </Text>
      </motion.div>

      {/* Salary Coverage */}
      <motion.div variants={item}>
        <Card variant="default" padding="lg" hover="glow">
          <div className="flex items-center justify-between">
            <div>
              <Text size="xs" color="secondary" className="uppercase tracking-wide mb-2">
                Покрытие данными
              </Text>
              <div className="flex items-baseline gap-3">
                <div className="text-4xl font-bold text-accent-primary">
                  {formatLargeNumber(analytics.salaryDistribution.withSalary)}
                </div>
                <Text size="lg" color="tertiary">
                  / {formatLargeNumber(analytics.totalVacancies)}
                </Text>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-text-primary">
                {analytics.salaryDistribution.percentWithSalary}%
              </div>
              <Text size="xs" color="secondary" className="mt-1">
                вакансий с зарплатой
              </Text>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Salary by Seniority */}
      {hasData ? (
        <motion.div variants={item}>
          <Heading level="h3" weight="medium" color="primary" className="mb-4 uppercase tracking-wide">
            По уровням сениорности
          </Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {salaryData.map((level, index) => (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.3 }}
              >
                <Card variant="default" padding="lg" hover="lift">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Text size="sm" weight="bold" color="primary" className="uppercase">
                        {SENIORITY_LABELS[level.level] || level.level}
                      </Text>
                      <Text size="xs" color="tertiary">
                        {formatLargeNumber(level.count)} вакансий
                      </Text>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <Text size="xs" color="secondary">Средняя:</Text>
                        <Text size="lg" weight="bold" color="accent" className="font-medium">
                          {Math.round(((level.avgMin + level.avgMax) / 2) / 1000)}K ₽
                        </Text>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <Text size="xs" color="tertiary">От</Text>
                          <Text size="sm" weight="medium" color="primary">
                            {Math.round(level.avgMin / 1000)}K
                          </Text>
                        </div>
                        <div className="flex-1 h-1 bg-linear-to-r from-background-tertiary via-accent-primary to-background-tertiary rounded-full"></div>
                        <div className="text-right">
                          <Text size="xs" color="tertiary">До</Text>
                          <Text size="sm" weight="medium" color="primary">
                            {Math.round(level.avgMax / 1000)}K
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div variants={item}>
          <Card variant="bordered" padding="lg">
            <Text color="secondary" className="text-center">
              Недостаточно данных о зарплатах для анализа
            </Text>
          </Card>
        </motion.div>
      )}

      {/* Top Companies */}
      {topCompanies.length > 0 && (
        <motion.div variants={item}>
          <Heading level="h3" weight="medium" color="primary" className="mb-4 uppercase tracking-wide">
            Топ компании по зарплатам
          </Heading>
          <div className="space-y-3">
            {topCompanies.map((company, index) => (
              <Card key={company.company} variant="default" padding="lg" hover="lift">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-accent-primary">
                      #{index + 1}
                    </div>
                    <div>
                      <Text size="base" weight="bold" color="primary">
                        {company.company}
                      </Text>
                      <Text size="xs" color="secondary">
                        {formatLargeNumber(company.vacancies)} вакансий
                      </Text>
                    </div>
                  </div>
                  <div className="text-right">
                    <Text size="lg" weight="bold" color="accent" className="font-medium">
                      {Math.round(((company.avgMinSalary + company.avgMaxSalary) / 2) / 1000)}K ₽
                    </Text>
                    <Text size="xs" color="tertiary">средняя зарплата</Text>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
