'use client'
import { useEffect, useState, useCallback } from 'react'

interface Position {
  x: number
  y: number
}

const GRID_SIZE = 25
const INITIAL_SPEED = 150

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>([{ x: 12, y: 12 }])
  const [food, setFood] = useState<Position>({ x: 18, y: 18 })
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT')
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    }
    setFood(newFood)
  }, [])

  const resetGame = useCallback(() => {
    setSnake([{ x: 12, y: 12 }])
    setDirection('RIGHT')
    setGameOver(false)
    setScore(0)
    setIsPaused(false)
    generateFood()
  }, [generateFood])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault()
        setIsPaused(prev => !prev)
        return
      }

      if (gameOver) return

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction !== 'DOWN') setDirection('UP')
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction !== 'UP') setDirection('DOWN')
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction !== 'RIGHT') setDirection('LEFT')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction !== 'LEFT') setDirection('RIGHT')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [direction, gameOver])

  useEffect(() => {
    if (gameOver || isPaused) return

    const moveSnake = () => {
      setSnake(prevSnake => {
        const newSnake = [...prevSnake]
        const head = { ...newSnake[0] }

        switch (direction) {
          case 'UP':
            head.y -= 1
            break
          case 'DOWN':
            head.y += 1
            break
          case 'LEFT':
            head.x -= 1
            break
          case 'RIGHT':
            head.x += 1
            break
        }

        // Check wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true)
          return prevSnake
        }

        // Check self collision
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true)
          return prevSnake
        }

        newSnake.unshift(head)

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          setScore(prev => prev + 10)
          generateFood()
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }

    const gameLoop = setInterval(moveSnake, INITIAL_SPEED)
    return () => clearInterval(gameLoop)
  }, [direction, food, gameOver, isPaused, generateFood])

  return (
    <div className="h-full flex flex-col font-mono">
      {/* Game Info Header */}
      <div className="flex justify-between items-center mb-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-[var(--text-secondary)]">MODE:</span>
          <span className="text-[var(--accent-cyan)] neon-glow font-bold">ЗМЕЙКА</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[var(--text-secondary)]">
            SCORE: <span className="text-[var(--accent-cyan)] neon-glow">{score}</span>
          </div>
          <div className="text-[var(--text-muted)] text-[10px]">
            {isPaused ? '[PAUSED]' : '[ACTIVE]'}
          </div>
        </div>
      </div>

      {/* Game Grid - Full Terminal Size */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 grid" style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
        }}>
          {/* Grid cells */}
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE
            const y = Math.floor(i / GRID_SIZE)
            const isSnake = snake.some(s => s.x === x && s.y === y)
            const isHead = snake[0]?.x === x && snake[0]?.y === y
            const isFood = food.x === x && food.y === y

            return (
              <div
                key={i}
                className="border-[0.5px] border-[var(--grid-color)]"
                style={{
                  backgroundColor: isSnake
                    ? (isHead ? 'var(--accent-cyan)' : 'var(--text-primary)')
                    : isFood
                    ? 'var(--accent-pink)'
                    : 'transparent',
                  boxShadow: isSnake
                    ? (isHead ? '0 0 8px var(--accent-cyan)' : '0 0 4px var(--text-primary)')
                    : isFood
                    ? '0 0 12px var(--accent-pink)'
                    : 'none'
                }}
              />
            )
          })}
        </div>

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
            <div className="text-[var(--accent-pink)] text-xl md:text-3xl font-bold mb-4 neon-glow-pink">
              GAME OVER
            </div>
            <div className="text-[var(--text-primary)] text-base md:text-xl mb-6">
              FINAL SCORE: {score}
            </div>
            <button
              onClick={resetGame}
              className="px-6 py-2 border-2 border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all"
            >
              [RESTART]
            </button>
          </div>
        )}
      </div>

      {/* Controls Info Footer */}
      <div className="mt-3 text-[10px] text-[var(--text-muted)] flex gap-4">
        <span>→ ARROWS/WASD: Move</span>
        <span>→ SPACE: Pause</span>
      </div>
    </div>
  )
}
