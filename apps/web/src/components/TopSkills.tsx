/**
 * Компонент для отображения топовых навыков
 */

import { getAnalytics } from '@/lib/api';

export async function TopSkills() {
  let topSkills: Array<{ skill: string; count: number }> = [];

  try {
    const analytics = await getAnalytics();
    topSkills = analytics.topSkills.slice(0, 8); // Берем топ-8
  } catch (err) {
    console.error('Failed to fetch top skills:', err);
    return null;
  }

  if (topSkills.length === 0) {
    return null;
  }

  // Находим максимальное количество для нормализации
  const maxCount = Math.max(...topSkills.map((s) => s.count));

  return (
    <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 rounded-lg box-glow">
      <div className="text-[var(--text-primary)] font-bold mb-4">
        TRENDING SKILLS:
      </div>

      <div className="space-y-3">
        {topSkills.map(({ skill, count }) => {
          const percentage = Math.round((count / maxCount) * 100);
          const barWidth = `${percentage}%`;

          return (
            <div key={skill} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[var(--text-secondary)] text-sm font-mono">
                  {skill}
                </span>
                <span className="text-[var(--text-muted)] text-xs">
                  {count}
                </span>
              </div>
              <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--text-primary)] rounded-full transition-all duration-300 group-hover:opacity-80"
                  style={{ width: barWidth }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
