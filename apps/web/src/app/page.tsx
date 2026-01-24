export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-2xl">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">WorkWolk</h1>
          <p className="text-xl text-white/80">Агрегатор данных IT рынка</p>
        </div>

        {/* Description */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">В разработке</h2>
          <p className="text-white/90 mb-6">
            Собираем и анализируем данные о вакансиях с HH.ru, Habr Career и других площадок
            для мониторинга трендов IT рынка.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 rounded-full bg-white/20 text-sm">Вакансии</span>
            <span className="px-4 py-2 rounded-full bg-white/20 text-sm">Зарплаты</span>
            <span className="px-4 py-2 rounded-full bg-white/20 text-sm">Навыки</span>
            <span className="px-4 py-2 rounded-full bg-white/20 text-sm">Тренды</span>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">Аналитика</div>
            <div className="text-sm text-white/70">Графики и отчёты</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
            <div className="text-2xl mb-2">🔍</div>
            <div className="font-medium">Скрапинг</div>
            <div className="text-sm text-white/70">Автосбор данных</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
            <div className="text-2xl mb-2">📡</div>
            <div className="font-medium">API</div>
            <div className="text-sm text-white/70">REST интерфейс</div>
          </div>
        </div>

        {/* Contact */}
        <div className="text-white/60 text-sm">
          <a href="https://t.me/litury" className="hover:text-white transition-colors">
            @litury
          </a>
          <span className="mx-2">•</span>
          <a href="https://github.com/litury/workwolk-analytics" className="hover:text-white transition-colors">
            GitHub
          </a>
        </div>
      </div>
    </main>
  )
}
