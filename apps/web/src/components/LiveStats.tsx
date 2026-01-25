/**
 * Компонент для отображения живой статистики
 */

import { getAnalytics, type IAnalytics } from '@/lib/api';

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'никогда';

  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  return `${diffDays} дн назад`;
}

export async function LiveStats() {
  let analytics: IAnalytics | null = null;
  let error: string | null = null;

  try {
    analytics = await getAnalytics();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load analytics';
    console.error('Failed to fetch analytics:', err);
  }

  // Если произошла ошибка, показываем fallback
  if (error || !analytics) {
    return (
      <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 rounded-lg">
        <div className="text-[var(--text-muted)] text-sm mb-2">STATS:</div>
        <div className="text-[var(--accent-pink)]">
          {error || 'API недоступен'}
        </div>
        <div className="text-[var(--text-muted)] text-xs mt-2">
          Убедитесь, что бэкенд запущен на порту 3001
        </div>
      </div>
    );
  }

  const {
    totalVacancies,
    remoteVacancies,
    averageSalaryFrom,
    averageSalaryTo,
    lastScrapedAt,
    activeSources,
  } = analytics;

  const remotePercent = totalVacancies > 0
    ? Math.round((remoteVacancies / totalVacancies) * 100)
    : 0;

  return (
    <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 rounded-lg box-glow">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-[var(--text-primary)] font-bold">STATS:</div>
        <div className="text-[var(--text-muted)] text-xs">
          LAST UPDATE: {formatRelativeTime(lastScrapedAt)}
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Всего вакансий */}
        <div>
          <div className="text-[var(--text-muted)] text-xs mb-1">
            {'>'} Vacancies in DB:
          </div>
          <div className="text-[var(--text-primary)] font-mono text-2xl neon-glow">
            {totalVacancies.toLocaleString('ru-RU')}
          </div>
        </div>

        {/* Удаленных вакансий */}
        <div>
          <div className="text-[var(--text-muted)] text-xs mb-1">
            {'>'} Remote jobs:
          </div>
          <div className="text-[var(--accent-cyan)] font-mono text-2xl neon-glow">
            {remoteVacancies.toLocaleString('ru-RU')}
            <span className="text-sm ml-2">({remotePercent}%)</span>
          </div>
        </div>

        {/* Средняя зарплата (от) */}
        <div>
          <div className="text-[var(--text-muted)] text-xs mb-1">
            {'>'} Avg salary (from):
          </div>
          <div className="text-[var(--accent-green)] font-mono text-xl">
            {averageSalaryFrom
              ? `${averageSalaryFrom.toLocaleString('ru-RU')} ₽`
              : 'N/A'}
          </div>
        </div>

        {/* Средняя зарплата (до) */}
        <div>
          <div className="text-[var(--text-muted)] text-xs mb-1">
            {'>'} Avg salary (to):
          </div>
          <div className="text-[var(--accent-green)] font-mono text-xl">
            {averageSalaryTo
              ? `${averageSalaryTo.toLocaleString('ru-RU')} ₽`
              : 'N/A'}
          </div>
        </div>
      </div>

      {/* Активные источники */}
      <div className="border-t border-[var(--border-color)] pt-3 mt-3">
        <div className="text-[var(--text-muted)] text-xs">
          {'>'} Sources active:{' '}
          <span className="text-[var(--text-primary)]">{activeSources}/3</span>
        </div>
      </div>
    </div>
  );
}
