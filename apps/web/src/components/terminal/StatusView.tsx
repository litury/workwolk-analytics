import type { StatusViewProps } from '@/types/terminal'
import { formatRelativeTime, formatLargeNumber, formatPercentage } from '@/lib/utils/formatters'
import { createStatusTree, ProgressBar } from '@/lib/utils/terminal'

export default function StatusView({ analytics, loading, error }: StatusViewProps) {
  if (error) {
    return (
      <div className="font-mono text-xs md:text-sm space-y-4">
        <div className="text-[var(--accent-pink)] neon-glow-pink">
          [ERROR] SYSTEM_FAILURE
        </div>
        <div className="text-[var(--text-muted)]">
          {error}
        </div>
        <div className="text-[var(--text-secondary)]">
          {'>'} Попробуйте обновить страницу
        </div>
      </div>
    )
  }

  if (loading || !analytics) {
    return (
      <div className="font-mono text-xs md:text-sm space-y-4">
        <div className="text-[var(--text-secondary)] pulse">
          [LOADING...] Инициализация системы...
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-[var(--border-color)] pulse w-3/4"></div>
          <div className="h-4 bg-[var(--border-color)] pulse w-1/2"></div>
          <div className="h-4 bg-[var(--border-color)] pulse w-2/3"></div>
        </div>
      </div>
    )
  }

  const remotePercent = analytics.totalVacancies > 0
    ? (analytics.remoteVacancies / analytics.totalVacancies) * 100
    : 0

  const statusTreeItems = [
    {
      label: 'Database',
      value: `ONLINE (${formatLargeNumber(analytics.totalVacancies)} records)`
    },
    {
      label: 'Sources',
      value: `${analytics.activeSources}/3 ACTIVE`
    },
    {
      label: 'Last Sync',
      value: formatRelativeTime(analytics.lastScrapedAt)
    },
    {
      label: 'Remote Jobs',
      value: formatPercentage(analytics.remoteVacancies, analytics.totalVacancies)
    }
  ]

  const treeLines = createStatusTree(statusTreeItems)

  return (
    <div className="font-mono text-xs md:text-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-[var(--text-secondary)]">[SYSTEM STATUS]</span>
        <span className="text-[var(--accent-cyan)] neon-glow">MONITOR_v1.0</span>
      </div>

      {/* ASCII Status Tree - компактный */}
      <div className="space-y-1 text-[var(--text-primary)] text-xs">
        {treeLines.map((line, i) => (
          <div key={i} className="text-[var(--text-primary)]">
            {line}
          </div>
        ))}
      </div>

      {/* Quick Metrics Grid - компактный */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Vacancies */}
        <div className="border border-[var(--border-color)] p-3 bg-[var(--bg-secondary)] flex flex-col justify-center">
          <div className="text-[var(--text-muted)] text-[9px] mb-1">TOTAL</div>
          <div className="text-xl md:text-3xl font-bold text-[var(--accent-cyan)] neon-glow">
            {formatLargeNumber(analytics.totalVacancies)}
          </div>
        </div>

        {/* Remote Percentage */}
        <div className="border border-[var(--border-color)] p-3 bg-[var(--bg-secondary)] flex flex-col justify-center">
          <div className="text-[var(--text-muted)] text-[9px] mb-1">REMOTE</div>
          <div className="text-xl md:text-3xl font-bold text-[var(--text-secondary)] neon-glow">
            {remotePercent.toFixed(1)}%
          </div>
        </div>

        {/* Active Sources */}
        <div className="border border-[var(--border-color)] p-3 bg-[var(--bg-secondary)] flex flex-col justify-center">
          <div className="text-[var(--text-muted)] text-[9px] mb-1">SOURCES</div>
          <div className="flex items-center gap-2">
            <span className="pulse text-[var(--text-secondary)]">●</span>
            <span className="text-lg md:text-xl font-bold text-[var(--text-primary)]">
              {analytics.activeSources}/3
            </span>
          </div>
        </div>

        {/* Last Update */}
        <div className="border border-[var(--border-color)] p-3 bg-[var(--bg-secondary)] flex flex-col justify-center">
          <div className="text-[var(--text-muted)] text-[9px] mb-1">SYNC</div>
          <div className="text-xs md:text-sm font-bold text-[var(--text-primary)]">
            {formatRelativeTime(analytics.lastScrapedAt)}
          </div>
        </div>
      </div>

      {/* Job Categories Distribution */}
      {analytics.categoryDistribution && analytics.categoryDistribution.length > 0 && (
        <div className="space-y-3">
          <div className="text-[var(--text-secondary)]">[JOB CATEGORIES]</div>
          <div className="space-y-2">
            {analytics.categoryDistribution.slice(0, 5).map((cat) => (
              <div key={cat.category} className="flex items-center justify-between text-xs border-l-2 border-[var(--accent-cyan)] pl-3 py-1">
                <span className="text-[var(--text-primary)] uppercase">{cat.category}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--text-muted)]">{formatLargeNumber(cat.count)}</span>
                  <span className="text-[var(--accent-cyan)] text-[9px]">
                    {cat.avgMinSalary > 0 ? `${Math.round(cat.avgMinSalary / 1000)}K-${Math.round(cat.avgMaxSalary / 1000)}K ₽` : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Format Distribution */}
      {analytics.workFormatDistribution && analytics.workFormatDistribution.length > 0 && (
        <div className="space-y-3">
          <div className="text-[var(--text-secondary)]">[WORK FORMAT]</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {analytics.workFormatDistribution.map((format) => {
              const percent = analytics.totalVacancies > 0
                ? (format.count / analytics.totalVacancies) * 100
                : 0
              return (
                <div key={format.format} className="border border-[var(--border-color)] p-2 bg-[var(--bg-secondary)]">
                  <div className="text-[var(--text-muted)] text-[8px] mb-1 uppercase">{format.format || 'other'}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg text-[var(--text-primary)] font-bold">{percent.toFixed(0)}%</span>
                    <span className="text-[9px] text-[var(--text-muted)]">({formatLargeNumber(format.count)})</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Contract Type Distribution */}
      {analytics.contractTypeDistribution && analytics.contractTypeDistribution.length > 0 && (
        <div className="space-y-3">
          <div className="text-[var(--text-secondary)]">[CONTRACT TYPE]</div>
          <div className="grid grid-cols-2 gap-2">
            {analytics.contractTypeDistribution.map((contract) => {
              const percent = analytics.totalVacancies > 0
                ? (contract.count / analytics.totalVacancies) * 100
                : 0
              return (
                <div key={contract.type} className="border border-[var(--border-color)] p-2 bg-[var(--bg-secondary)]">
                  <div className="text-[var(--text-muted)] text-[8px] mb-1 uppercase">{contract.type}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg text-[var(--text-primary)] font-bold">{percent.toFixed(0)}%</span>
                    <span className="text-[9px] text-[var(--text-muted)]">({formatLargeNumber(contract.count)})</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Company Size Distribution */}
      {analytics.companySizeDistribution && analytics.companySizeDistribution.length > 0 && (
        <div className="space-y-3">
          <div className="text-[var(--text-secondary)]">[COMPANY SIZE]</div>
          <div className="space-y-2">
            {analytics.companySizeDistribution.map((size) => (
              <div key={size.size} className="flex items-center justify-between text-xs border-l-2 border-[var(--text-secondary)] pl-3 py-1">
                <span className="text-[var(--text-primary)] uppercase">{size.size}</span>
                <span className="text-[var(--text-muted)]">{formatLargeNumber(size.count)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
