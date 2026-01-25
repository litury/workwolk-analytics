import type { VacanciesViewProps } from '@/types/terminal'
import { formatSalary, formatLargeNumber } from '@/lib/utils/formatters'

export default function VacanciesView({ analytics, vacancies, loading }: VacanciesViewProps) {
  if (loading || !analytics) {
    return (
      <div className="font-mono text-xs md:text-sm space-y-4">
        <div className="text-[var(--text-secondary)] pulse">
          [LOADING...] Загрузка вакансий...
        </div>
      </div>
    )
  }

  const remoteCount = analytics.remoteVacancies
  const totalCount = analytics.totalVacancies

  return (
    <div className="font-mono text-xs md:text-sm space-y-4">
      {/* Header - компактный */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-secondary)] text-xs">[VACANCIES]</span>
          <span className="text-[var(--accent-cyan)] neon-glow text-xs">LIVE</span>
        </div>
        <div className="text-[var(--text-muted)] text-[9px]">
          TOTAL: <span className="text-[var(--accent-cyan)]">{formatLargeNumber(totalCount)}</span> |
          REMOTE: <span className="text-[var(--text-secondary)]">{formatLargeNumber(remoteCount)}</span>
        </div>
      </div>

      {/* Vacancy Table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-full">
          {/* Table Header */}
          <div className="border-t border-b border-[var(--border-color)] py-2 grid grid-cols-12 gap-4 text-[var(--text-muted)] text-[10px]">
            <div className="col-span-3">COMPANY</div>
            <div className="col-span-4">ROLE</div>
            <div className="col-span-3">SALARY</div>
            <div className="col-span-2">REMOTE</div>
          </div>

          {/* Table Rows */}
          {vacancies.map((vacancy) => (
            <a
              key={vacancy.id}
              href={vacancy.url}
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-[var(--border-color)] py-3 grid grid-cols-12 gap-4 hover:bg-[rgba(0,255,159,0.05)] transition-colors cursor-pointer group"
            >
              <div className="col-span-3 text-[var(--text-primary)] truncate">
                {vacancy.company || 'Не указано'}
              </div>
              <div className="col-span-4 text-[var(--text-primary)] truncate group-hover:text-[var(--accent-cyan)] transition-colors">
                {vacancy.title}
              </div>
              <div className="col-span-3 text-[var(--text-secondary)]">
                {formatSalary(vacancy)}
              </div>
              <div className="col-span-2">
                {vacancy.remote ? (
                  <span className="text-[var(--accent-cyan)]">[✓ REMOTE]</span>
                ) : (
                  <span className="text-[var(--text-muted)]">[✗ OFFICE]</span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Vacancy Cards - Mobile */}
      <div className="md:hidden space-y-2">
        {vacancies.map((vacancy) => (
          <a
            key={vacancy.id}
            href={vacancy.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-[var(--border-color)] p-4 hover:bg-[rgba(0,255,159,0.05)] transition-colors"
          >
            <div className="space-y-2">
              <div className="text-[var(--accent-cyan)] font-bold">
                {vacancy.title}
              </div>
              <div className="text-[var(--text-primary)] text-[10px]">
                {vacancy.company || 'Не указано'}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[var(--text-secondary)]">
                  {formatSalary(vacancy)}
                </div>
                {vacancy.remote ? (
                  <span className="text-[var(--accent-cyan)] text-[10px]">[✓ REMOTE]</span>
                ) : (
                  <span className="text-[var(--text-muted)] text-[10px]">[✗ OFFICE]</span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>

    </div>
  )
}
