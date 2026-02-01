import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'

export const metadata: Metadata = {
  title: 'WorkWolk — Зарплаты IT разработчиков 2026 | Удалённые вакансии',
  description: 'Охотник за зарплатами. Data-driven аналитика IT рынка: реальные зарплаты из 5000+ вакансий, тренды, удалённая работа. Узнай, сколько платят за твой стек.',
  keywords: 'зарплаты it, вакансии разработчиков, удаленная работа, зарплаты программистов 2026, workwolk',
  openGraph: {
    title: 'WorkWolk — Зарплаты IT разработчиков 2026',
    description: 'Data-driven аналитика IT рынка: реальные зарплаты, тренды, удалённые вакансии',
    type: 'website',
    locale: 'ru_RU',
    siteName: 'WorkWolk',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WorkWolk — Охотник за зарплатами',
    description: 'Узнай свою рыночную стоимость. 5000+ вакансий с AI-анализом.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') ||
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.add(theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
