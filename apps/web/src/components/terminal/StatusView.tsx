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
    </div>
  )
}
