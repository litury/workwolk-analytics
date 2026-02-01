'use client'
import { motion } from 'framer-motion'
import type { VacanciesViewProps } from '@/types/terminal'
import { formatSalary, formatLargeNumber } from '@/lib/utils/formatters'
import { Card, Heading, Text } from '@/components/ui'

export default function VacanciesView({ analytics, vacancies, loading }: VacanciesViewProps) {
  if (loading || !analytics) {
    return (
      <div className="space-y-4">
        <div className="h-16 bg-background-secondary rounded-card animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-background-secondary rounded-card animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  const remoteCount = analytics.remoteVacancies
  const totalCount = analytics.totalVacancies

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <Heading level="h2" weight="bold" color="primary" className="uppercase tracking-wide">
            Вакансии
          </Heading>
          <Text size="sm" color="secondary" className="mt-1">
            Актуальные предложения на IT рынке
          </Text>
        </div>
        <Card variant="bordered" padding="sm">
          <div className="flex items-center gap-4 text-sm">
            <div>
              <Text size="xs" color="tertiary" className="uppercase">Всего</Text>
              <Text size="base" weight="bold" color="accent" className="mt-1">
                {formatLargeNumber(totalCount)}
              </Text>
            </div>
            <div className="w-px h-8 bg-border-primary"></div>
            <div>
              <Text size="xs" color="tertiary" className="uppercase">Remote</Text>
              <Text size="base" weight="bold" color="primary" className="mt-1">
                {formatLargeNumber(remoteCount)}
              </Text>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Desktop Table */}
      <motion.div variants={item} className="hidden lg:block">
        <Card variant="default" padding="none">
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border-primary bg-background-tertiary">
              <Text size="xs" color="tertiary" className="col-span-3 uppercase tracking-wide">
                Компания
              </Text>
              <Text size="xs" color="tertiary" className="col-span-4 uppercase tracking-wide">
                Должность
              </Text>
              <Text size="xs" color="tertiary" className="col-span-3 uppercase tracking-wide">
                Зарплата
              </Text>
              <Text size="xs" color="tertiary" className="col-span-2 uppercase tracking-wide">
                Формат
              </Text>
            </div>

            {/* Table Rows */}
            <div>
              {vacancies.map((vacancy, index) => (
                <motion.a
                  key={vacancy.id}
                  href={vacancy.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border-primary hover:bg-background-secondary transition-all duration-200 group"
                >
                  <div className="col-span-3">
                    <Text size="sm" color="primary" className="truncate">
                      {vacancy.company || 'Не указано'}
                    </Text>
                  </div>
                  <div className="col-span-4">
                    <Text
                      size="sm"
                      weight="medium"
                      color="primary"
                      className="truncate group-hover:text-accent-primary transition-colors"
                    >
                      {vacancy.title}
                    </Text>
                  </div>
                  <div className="col-span-3">
                    <Text size="sm" color="accent" className="font-medium">
                      {formatSalary(vacancy)}
                    </Text>
                  </div>
                  <div className="col-span-2">
                    {vacancy.remote ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-accent-primary bg-opacity-10 text-accent-primary text-xs font-medium">
                        Remote
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-background-tertiary text-text-tertiary text-xs">
                        Office
                      </span>
                    )}
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Mobile/Tablet Cards */}
      <motion.div variants={item} className="lg:hidden space-y-3">
        {vacancies.map((vacancy, index) => (
          <motion.a
            key={vacancy.id}
            href={vacancy.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
            whileHover={{ scale: 1.01 }}
            className="block"
          >
            <Card variant="default" padding="lg" hover="lift">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Text size="base" weight="bold" color="primary" className="mb-1">
                      {vacancy.title}
                    </Text>
                    <Text size="sm" color="secondary">
                      {vacancy.company || 'Не указано'}
                    </Text>
                  </div>
                  {vacancy.remote && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-accent-primary bg-opacity-10 text-accent-primary text-xs font-medium whitespace-nowrap">
                      Remote
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border-primary">
                  <Text size="sm" color="accent" className="font-medium">
                    {formatSalary(vacancy)}
                  </Text>
                  <Text size="xs" color="accentSecondary" className="hover:underline">
                    Подробнее →
                  </Text>
                </div>
              </div>
            </Card>
          </motion.a>
        ))}
      </motion.div>

      {vacancies.length === 0 && (
        <Card variant="bordered" padding="lg">
          <div className="text-center py-8">
            <Text color="secondary">Вакансии не найдены</Text>
          </div>
        </Card>
      )}
    </motion.div>
  )
}
