# Dockerfile для API сервера (Elysia/Bun)
# Используется для deployment в Dokploy

FROM oven/bun:1-alpine AS base
WORKDIR /app

# Установка зависимостей
FROM base AS deps
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --production

# Продакшн образ
FROM base AS runner
ENV NODE_ENV=production

# Копируем node_modules и исходники
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Экспонируем порт 3001 для API
EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Запускаем API сервер
CMD ["bun", "run", "src/index.ts"]
