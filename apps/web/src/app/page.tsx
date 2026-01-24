export default function Home() {
  return (
    <main className="min-h-screen terminal-grid scanlines noise relative overflow-hidden">
      {/* Matrix Rain Background (Optional Decorative Elements) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-[10%] data-stream text-xs" style={{ animationDelay: '0s' }}>01001000</div>
        <div className="absolute top-20 left-[30%] data-stream text-xs" style={{ animationDelay: '1s' }}>11010011</div>
        <div className="absolute top-0 left-[50%] data-stream text-xs" style={{ animationDelay: '2s' }}>10110101</div>
        <div className="absolute top-32 left-[70%] data-stream text-xs" style={{ animationDelay: '0.5s' }}>01110010</div>
        <div className="absolute top-16 left-[85%] data-stream text-xs" style={{ animationDelay: '1.5s' }}>11001101</div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        {/* Terminal Header */}
        <div className="w-full max-w-5xl mb-6 fade-in">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm mb-2">
            <span className="pulse">●</span>
            <span className="font-mono">SYSTEM_ONLINE</span>
            <span className="ml-auto">v0.1.0</span>
          </div>
          <div className="h-[1px] bg-[var(--border-color)]"></div>
        </div>

        {/* ASCII Logo */}
        <div className="mb-6 md:mb-8 fade-in fade-in-delay-1">
          {/* Desktop Logo - Full ASCII art */}
          <pre className="hidden md:block text-[var(--text-primary)] text-sm leading-tight neon-glow" style={{ fontFamily: 'var(--font-mono)' }}>
{`
██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗██╗    ██╗ ██████╗ ██╗     ██╗  ██╗
██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝██║    ██║██╔═══██╗██║     ██║ ██╔╝
██║ █╗ ██║██║   ██║██████╔╝█████╔╝ ██║ █╗ ██║██║   ██║██║     █████╔╝
██║███╗██║██║   ██║██╔══██╗██╔═██╗ ██║███╗██║██║   ██║██║     ██╔═██╗
╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗╚███╔███╔╝╚██████╔╝███████╗██║  ██╗
 ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚══╝╚══╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝
`}
          </pre>

          {/* Mobile Logo - Compact version */}
          <pre className="block md:hidden text-[var(--text-primary)] text-[11px] leading-tight neon-glow text-center" style={{ fontFamily: 'var(--font-mono)' }}>
{`
██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗
██║ █╗ ██║██║   ██║██████╔╝█████╔╝
╚███╔███╔╝╚██████╔╝██╔══██╗██╔═██╗
 ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
`}
          </pre>
        </div>

        {/* Tagline with Cursor */}
        <div className="mb-12 text-center fade-in fade-in-delay-2">
          <h1 className="text-xl md:text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}>
            АГРЕГАТОР ДАННЫХ IT РЫНКА<span className="cursor"></span>
          </h1>
          <p className="text-sm md:text-base text-[var(--text-muted)] font-mono">
            {'>'} Собираем и анализируем данные о вакансиях с HH.ru, Habr Career и других площадок
          </p>
        </div>

        {/* Status Box */}
        <div className="w-full max-w-4xl mb-6 md:mb-10 fade-in fade-in-delay-3">
          <div className="border-2 border-[var(--border-color)] p-4 md:p-8 box-glow relative bg-[var(--bg-secondary)]">
            {/* Terminal Window Header */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border-color)]">
              <div className="w-3 h-3 rounded-full bg-[var(--accent-pink)]"></div>
              <div className="w-3 h-3 rounded-full" style={{ background: 'var(--text-secondary)' }}></div>
              <div className="w-3 h-3 rounded-full bg-[var(--accent-cyan)]"></div>
              <span className="ml-2 text-xs text-[var(--text-muted)] hidden sm:inline">terminal://workwolk/status</span>
              <span className="ml-2 text-xs text-[var(--text-muted)] sm:hidden">term://status</span>
            </div>

            {/* Status Content */}
            <div className="space-y-3 font-mono text-sm">
              <div className="flex items-center gap-3">
                <span className="text-[var(--text-secondary)]">STATUS:</span>
                <span className="text-[var(--accent-pink)] neon-glow-pink font-bold">В РАЗРАБОТКЕ</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-4 py-2 border border-[var(--border-color)] text-xs hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] active:bg-[var(--text-primary)] active:text-[var(--bg-primary)] transition-all cursor-pointer touch-manipulation">[ВАКАНСИИ]</span>
                <span className="px-4 py-2 border border-[var(--border-color)] text-xs hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] active:bg-[var(--text-primary)] active:text-[var(--bg-primary)] transition-all cursor-pointer touch-manipulation">[ЗАРПЛАТЫ]</span>
                <span className="px-4 py-2 border border-[var(--border-color)] text-xs hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] active:bg-[var(--text-primary)] active:text-[var(--bg-primary)] transition-all cursor-pointer touch-manipulation">[НАВЫКИ]</span>
                <span className="px-4 py-2 border border-[var(--border-color)] text-xs hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] active:bg-[var(--text-primary)] active:text-[var(--bg-primary)] transition-all cursor-pointer touch-manipulation">[ТРЕНДЫ]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="w-full max-w-5xl grid md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-10">
          {/* Analytics Card */}
          <div className="border-2 border-[var(--border-color)] p-4 md:p-6 box-glow hover:border-[var(--accent-cyan)] active:border-[var(--accent-cyan)] transition-all bg-[var(--bg-secondary)] fade-in fade-in-delay-4">
            <div className="text-3xl md:text-4xl mb-3 md:mb-4 text-[var(--accent-cyan)]">█▓▒░</div>
            <h3 className="text-base md:text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              АНАЛИТИКА
            </h3>
            <p className="text-xs md:text-sm text-[var(--text-muted)] font-mono mb-3 md:mb-4">
              Графики и отчёты в реальном времени
            </p>
            <div className="text-[10px] md:text-xs text-[var(--text-muted)] font-mono">
              <div>$ analytics.run()</div>
              <div className="text-[var(--text-secondary)]">{'>'} Processing data...</div>
            </div>
          </div>

          {/* Scraping Card */}
          <div className="border-2 border-[var(--border-color)] p-4 md:p-6 box-glow hover:border-[var(--text-secondary)] active:border-[var(--text-secondary)] transition-all bg-[var(--bg-secondary)] fade-in fade-in-delay-5">
            <div className="text-3xl md:text-4xl mb-3 md:mb-4 text-[var(--text-secondary)]">▓▓▓▒</div>
            <h3 className="text-base md:text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              СКРАПИНГ
            </h3>
            <p className="text-xs md:text-sm text-[var(--text-muted)] font-mono mb-3 md:mb-4">
              Автоматический сбор данных
            </p>
            <div className="text-[10px] md:text-xs text-[var(--text-muted)] font-mono">
              <div>$ scraper.start()</div>
              <div className="text-[var(--text-secondary)]">{'>'} Fetching sources...</div>
            </div>
          </div>

          {/* API Card */}
          <div className="border-2 border-[var(--border-color)] p-4 md:p-6 box-glow hover:border-[var(--accent-pink)] active:border-[var(--accent-pink)] transition-all bg-[var(--bg-secondary)] fade-in fade-in-delay-6">
            <div className="text-3xl md:text-4xl mb-3 md:mb-4 text-[var(--accent-pink)]">▒▒░░</div>
            <h3 className="text-base md:text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              API
            </h3>
            <p className="text-xs md:text-sm text-[var(--text-muted)] font-mono mb-3 md:mb-4">
              REST интерфейс для интеграций
            </p>
            <div className="text-[10px] md:text-xs text-[var(--text-muted)] font-mono">
              <div>$ api.connect()</div>
              <div className="text-[var(--text-secondary)]">{'>'} Ready for requests</div>
            </div>
          </div>
        </div>

        {/* Footer / Contact */}
        <div className="w-full max-w-5xl mt-6 md:mt-8 fade-in fade-in-delay-6">
          <div className="h-[1px] bg-[var(--border-color)] mb-4"></div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm font-mono text-[var(--text-muted)]">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <a
                href="https://t.me/litury"
                className="hover:text-[var(--text-primary)] hover:neon-glow transition-all flex items-center gap-2"
              >
                <span>{'>'}</span>
                <span>TELEGRAM: @litury</span>
              </a>
              <span className="hidden md:inline">|</span>
              <a
                href="https://github.com/litury/workwolk-analytics"
                className="hover:text-[var(--text-primary)] hover:neon-glow transition-all flex items-center gap-2"
              >
                <span>{'>'}</span>
                <span>GITHUB: workwolk-analytics</span>
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="pulse">●</span>
              <span>SYSTEM READY</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
