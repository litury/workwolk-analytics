/**
 * Компонент для отображения последних вакансий
 */

import { getVacancies, type IVacancy } from '@/lib/api';

function formatSalary(vacancy: IVacancy): string {
  if (!vacancy.salaryFrom && !vacancy.salaryTo) return 'не указано';

  const currency = vacancy.currency || 'RUB';
  const symbol = currency === 'RUB' ? '₽' : currency === 'USD' ? '$' : '€';

  if (vacancy.salaryFrom && vacancy.salaryTo) {
    return `${vacancy.salaryFrom.toLocaleString('ru-RU')}–${vacancy.salaryTo.toLocaleString('ru-RU')} ${symbol}`;
  }

  if (vacancy.salaryFrom) {
    return `от ${vacancy.salaryFrom.toLocaleString('ru-RU')} ${symbol}`;
  }

  if (vacancy.salaryTo) {
    return `до ${vacancy.salaryTo.toLocaleString('ru-RU')} ${symbol}`;
  }

  return 'не указано';
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
}

export async function RecentVacancies() {
  let vacancies: IVacancy[] = [];

  try {
    const response = await getVacancies({ limit: 5 });
    vacancies = response.data;
  } catch (err) {
    console.error('Failed to fetch recent vacancies:', err);
    return null;
  }

  if (vacancies.length === 0) {
    return (
      <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 rounded-lg">
        <div className="text-[var(--text-primary)] font-bold mb-4">
          RECENT VACANCIES:
        </div>
        <div className="text-[var(--text-muted)] text-sm">
          Нет вакансий в базе. Запустите скрапинг: <code className="text-[var(--accent-cyan)]">GET /api/vacancies/scrape</code>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 rounded-lg box-glow">
      <div className="text-[var(--text-primary)] font-bold mb-4">
        RECENT VACANCIES:
      </div>

      {/* Таблица для desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border-color)]">
              <th className="pb-2 pr-4">Company</th>
              <th className="pb-2 pr-4">Role</th>
              <th className="pb-2 pr-4">Salary</th>
              <th className="pb-2">Remote</th>
            </tr>
          </thead>
          <tbody>
            {vacancies.map((v) => (
              <tr
                key={v.id}
                className="border-b border-[var(--grid-color)] hover:bg-[var(--bg-primary)] transition-colors"
              >
                <td className="py-3 pr-4 text-[var(--text-secondary)]">
                  {truncate(v.company || 'N/A', 20)}
                </td>
                <td className="py-3 pr-4 text-[var(--text-primary)]">
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--accent-cyan)] transition-colors underline"
                  >
                    {truncate(v.title, 35)}
                  </a>
                </td>
                <td className="py-3 pr-4 text-[var(--accent-green)]">
                  {formatSalary(v)}
                </td>
                <td className="py-3">
                  {v.remote ? (
                    <span className="text-[var(--accent-cyan)]">🏠</span>
                  ) : (
                    <span className="text-[var(--text-muted)]">🏢</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Карточки для mobile */}
      <div className="md:hidden space-y-3">
        {vacancies.map((v) => (
          <div
            key={v.id}
            className="border border-[var(--grid-color)] p-3 rounded bg-[var(--bg-primary)]"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-[var(--text-primary)] text-sm font-semibold">
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--accent-cyan)] transition-colors underline"
                >
                  {truncate(v.title, 30)}
                </a>
              </div>
              <div>
                {v.remote ? (
                  <span className="text-[var(--accent-cyan)]">🏠</span>
                ) : (
                  <span className="text-[var(--text-muted)]">🏢</span>
                )}
              </div>
            </div>
            <div className="text-[var(--text-secondary)] text-xs mb-1">
              {v.company || 'N/A'}
            </div>
            <div className="text-[var(--accent-green)] text-xs">
              {formatSalary(v)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
