'use client'

import { Container, Heading, Text, Card } from '@/components/ui'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background-primary py-16">
      <Container maxWidth="lg">
        <div className="space-y-12">
          {/* Hero */}
          <div className="text-center">
            <Heading level="h1" weight="bold" color="primary" className="mb-4">
              О проекте WorkWolk
            </Heading>
            <Text size="lg" color="secondary">
              Data-driven платформа для анализа IT рынка труда в России
            </Text>
          </div>

          {/* Что мы делаем */}
          <Card variant="default" padding="lg">
            <Heading level="h2" weight="medium" color="primary" className="mb-4">
              Что мы делаем
            </Heading>
            <div className="space-y-3">
              <Text>
                WorkWolk — это не просто агрегатор вакансий. Это AI-powered аналитическая платформа,
                которая помогает IT-специалистам принимать правильные карьерные решения на основе данных.
              </Text>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li>Собираем вакансии с HH.ru, Habr Career, SuperJob</li>
                <li>Анализируем зарплаты с помощью AI (Google Gemini)</li>
                <li>Отслеживаем тренды и требования к навыкам</li>
                <li>Фокусируемся на удалённой работе</li>
              </ul>
            </div>
          </Card>

          {/* Три столпа */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="bordered" padding="lg" hover="lift">
              <Heading level="h3" weight="medium" color="accent" className="mb-3">
                Прозрачность зарплат
              </Heading>
              <Text size="sm" color="secondary">
                Реальные данные. Знай свою цену.
              </Text>
            </Card>

            <Card variant="bordered" padding="lg" hover="lift">
              <Heading level="h3" weight="medium" color="accent" className="mb-3">
                Экономия времени
              </Heading>
              <Text size="sm" color="secondary">
                Все источники в одном месте.
              </Text>
            </Card>

            <Card variant="bordered" padding="lg" hover="lift">
              <Heading level="h3" weight="medium" color="accent" className="mb-3">
                Data-driven решения
              </Heading>
              <Text size="sm" color="secondary">
                Данные, не мнения.
              </Text>
            </Card>
          </div>

          {/* Источники */}
          <Card variant="blur" padding="lg">
            <Heading level="h2" weight="medium" color="primary" className="mb-4">
              Источники данных
            </Heading>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Text weight="medium" color="primary">HH.ru</Text>
                <Text size="sm" color="secondary">Основной источник вакансий</Text>
              </div>
              <div>
                <Text weight="medium" color="primary">Habr Career</Text>
                <Text size="sm" color="secondary">IT-специфичные позиции</Text>
              </div>
              <div>
                <Text weight="medium" color="primary">SuperJob</Text>
                <Text size="sm" color="secondary">Дополнительный охват</Text>
              </div>
            </div>
          </Card>

          {/* Технологии */}
          <Card variant="default" padding="lg">
            <Heading level="h2" weight="medium" color="primary" className="mb-4">
              Технологии
            </Heading>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <Text weight="medium" color="accent">Scraping</Text>
                <Text size="sm" color="secondary">Playwright</Text>
              </div>
              <div>
                <Text weight="medium" color="accent">AI Analysis</Text>
                <Text size="sm" color="secondary">Google Gemini 3</Text>
              </div>
              <div>
                <Text weight="medium" color="accent">Database</Text>
                <Text size="sm" color="secondary">PostgreSQL</Text>
              </div>
              <div>
                <Text weight="medium" color="accent">Frontend</Text>
                <Text size="sm" color="secondary">Next.js 15 + React 19</Text>
              </div>
            </div>
          </Card>

          {/* Контакты */}
          <div className="text-center">
            <Text size="sm" color="secondary">
              Вопросы, предложения, баги?{' '}
              <a
                href="https://t.me/litury"
                className="text-accent-primary hover:underline"
              >
                Напишите в Telegram
              </a>
            </Text>
          </div>
        </div>
      </Container>
    </div>
  )
}
