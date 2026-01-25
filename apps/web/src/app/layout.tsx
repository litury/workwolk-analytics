import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WorkWolk - Агрегатор данных IT рынка',
  description: 'Собираем и анализируем данные о вакансиях для мониторинга трендов IT рынка',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
