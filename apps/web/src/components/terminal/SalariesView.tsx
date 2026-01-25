import { motion } from 'framer-motion'
import type { BaseViewProps } from '@/types/terminal'
import { formatLargeNumber } from '@/lib/utils/formatters'

const EXPERIENCE_LABELS: Record<string, string> = {
  'noExperience': 'Без опыта',
  '1-3': 'Junior (1-3 года)',
  '3-6': 'Middle (3-6 лет)',
  '6+': 'Senior (6+ лет)',
}

export default function SalariesView({ analytics, loading }: BaseViewProps) {
  if (loading || !analytics) {
    return (
      <div className="font-mono text-xs md:text-sm space-y-4">
        <div className="text-[var(--text-secondary)] pulse">
          [LOADING...] Анализ зарплат...
        </div>
      </div>
    )
  }

  // Приоритет: базовые данные (salaryByExperience) ВСЕГДА
  const salaryData = analytics.salaryByExperience || []
  const hasData = salaryData.length > 0

  // Показывать enriched данные только если их достаточно
  const hasEnrichedData = analytics.salaryPercentiles?.bySeniority && analytics.salaryPercentiles.bySeniority.length >= 3
  const topCompanies = analytics.topCompanies?.slice(0, 5) || []

  return (
    <div className="font-mono text-xs md:text-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-[var(--text-secondary)] text-xs">[SALARIES]</span>
        <span className="text-[var(--accent-cyan)] neon-glow text-xs">MARKET</span>
      </div>

      {/* Section 1: Salary Coverage Info */}
      <div className="border border-[var(--border-color)] p-3 bg-[var(--bg-secondary)]">
        <div className="text-[var(--text-muted)] text-[9px] mb-2">SALARY_COVERAGE</div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[var(--accent-cyan)] neon-glow">
            {formatLargeNumber(analytics.salaryDistribution.withSalary)}
          </span>
          <span className="text-[var(--text-muted)]">/ {formatLargeNumber(analytics.totalVacancies)}</span>
          <span className="text-[var(--text-secondary)] ml-2">
            ({analytics.salaryDistribution.percentWithSalary}%)
          </span>
        </div>
        <div className="text-[var(--text-muted)] text-[9px] mt-1">
          вакансий с указанной зарплатой
        </div>
      </div>

      {/* Section 2: Salary by Experience (ОСНОВНОЕ) */}
      {hasData ? (
        <div className="space-y-3">
          <div className="text-[var(--text-muted)] text-[9px]">SALARY_BY_EXPERIENCE</div>
          {salaryData.map((level, index) => (
            <motion.div
              key={level.experience}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="border border-[var(--border-color)] p-3 bg-[var(--bg-secondary)] space-y-2"
            >
              {/* Experience Level Header */}
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-primary)] font-bold text-xs">
                  {EXPERIENCE_LABELS[level.experience] || level.experience}
                </span>
                <span className="text-[var(--text-muted)] text-[9px]">
                  {formatLargeNumber(level.count)} вакансий
                </span>
              </div>

              {/* Percentiles */}
              <div className="grid grid-cols-3 gap-2">
                <div className="border-l-2 border-[var(--text-secondary)] pl-2">
                  <div className="text-[var(--text-muted)] text-[8px]">P25</div>
                  <div className="text-[var(--text-primary)] font-bold text-sm">
                    {Math.round(level.p25 / 1000)}K
                  </div>
                </div>
                <div className="border-l-2 border-[var(--accent-cyan)] pl-2">
                  <div className="text-[var(--text-muted)] text-[8px]">P50 (Медиана)</div>
                  <div className="text-[var(--accent-cyan)] font-bold text-sm neon-glow">
                    {Math.round(level.p50 / 1000)}K
                  </div>
                </div>
                <div className="border-l-2 border-[var(--text-secondary)] pl-2">
                  <div className="text-[var(--text-muted)] text-[8px]">P75</div>
                  <div className="text-[var(--text-primary)] font-bold text-sm">
                    {Math.round(level.p75 / 1000)}K
                  </div>
                </div>
              </div>

              {/* Average Range */}
              <div className="text-[var(--text-muted)] text-[9px] pt-1 border-t border-[var(--border-color)]">
                Средняя вилка:{' '}
                <span className="text-[var(--text-primary)]">
                  {Math.round(level.avgFrom / 1000)}K – {Math.round(level.avgTo / 1000)}K ₽
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="border border-[var(--border-color)] p-4 bg-[var(--bg-secondary)] text-center">
          <div className="text-[var(--text-muted)]">
            Недостаточно данных о зарплатах по уровням опыта
          </div>
        </div>
      )}

      {/* Section 3: Top Companies (если есть enriched данные) */}
      {topCompanies.length >= 3 && (
        <div className="space-y-3">
          <div className="text-[var(--text-muted)] text-[9px]">TOP_COMPANIES (enriched)</div>
          {topCompanies.map((company, index) => (
            <motion.div
              key={company.company}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="flex items-center justify-between text-xs border-l-2 border-[var(--accent-cyan)] pl-3 py-1"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[var(--text-primary)]">{company.company}</span>
                <div className="flex items-center gap-2">
                  {company.type && (
                    <span className="text-[var(--text-muted)] text-[8px] px-1 border border-[var(--border-color)]">
                      {company.type}
                    </span>
                  )}
                  <span className="text-[var(--text-muted)] text-[8px]">
                    {company.vacancies} вак. / {company.categories} кат.
                  </span>
                </div>
              </div>
              <div className="text-[var(--accent-cyan)] text-[9px] text-right">
                {company.avgMinSalary > 0 ? (
                  <>{Math.round(company.avgMinSalary / 1000)}-{Math.round(company.avgMaxSalary / 1000)}K</>
                ) : 'N/A'}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Section 4: Enriched Percentiles (опционально, если есть достаточно данных) */}
      {hasEnrichedData && (
        <div className="space-y-3 border border-[var(--border-color)] p-3 bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-2">
            <div className="text-[var(--text-muted)] text-[9px]">AI_ENRICHED_DATA</div>
            <div className="text-[8px] px-1 border border-[var(--accent-cyan)] text-[var(--accent-cyan)]">
              BETA
            </div>
          </div>
          {analytics.salaryPercentiles.bySeniority.map((level) => (
            <div key={level.level} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-primary)] uppercase font-bold">{level.level}</span>
                <span className="text-[var(--text-muted)] text-[9px]">{formatLargeNumber(level.count)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-[var(--text-muted)] text-[8px]">P25</div>
                  <div className="text-[var(--text-primary)] font-bold">
                    {Math.round(level.p25 / 1000)}K
                  </div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)] text-[8px]">P50</div>
                  <div className="text-[var(--accent-cyan)] font-bold neon-glow">
                    {Math.round(level.p50 / 1000)}K
                  </div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)] text-[8px]">P75</div>
                  <div className="text-[var(--text-secondary)] font-bold">
                    {Math.round(level.p75 / 1000)}K
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
