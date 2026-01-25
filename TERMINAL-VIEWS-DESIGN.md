# 🖥️ WORKWOLK Terminal Views - Design Specification

**Используя обогащенные AI данные (550 вакансий)**

---

## 📊 Доступные данные (новые поля после AI обогащения)

### Категоризация
- `jobCategory`: frontend | backend | devops | mobile | data | qa | product | fullstack | ai-ml | security | other
- `jobTags`: массив 2-5 технологий (lowercase)
- `seniorityLevel`: junior | middle | senior | lead | principal

### Компании
- `companyNameNormalized`: унифицированное название ("Яндекс" вместо "ООО Яндекс")
- `companyType`: product | outsource | consulting | startup
- `companySize`: 1-10 | 11-50 | 51-200 | 201-500 | 500+
- `companyIndustry`: Fintech | E-commerce | SaaS | GameDev | etc.

### Технологии
- `techStack`: массив `{ name, category, required }`
  - category: language | framework | tool | cloud
  - required: boolean (must-have vs nice-to-have)

### Условия работы
- `workFormat`: remote | hybrid | office
- `contractType`: permanent | contract | freelance | intern
- `benefits`: массив строк (ДМС, Опционы, Обучение, etc.)

### Зарплаты
- `salaryFrom`, `salaryTo`: оригинальные из вакансии (могут быть null)
- `salaryRecommendation`: AI-оценка `{ min, max, currency, confidence, reasoning }`
  - confidence: low | medium | high

### AI
- `requiresAi`: boolean флаг упоминания AI/ML/GPT
- `descriptionShort`: Twitter-style краткое описание (200-300 chars)

---

## 1️⃣ [HOME] DASHBOARD

**Цель:** Приветственный экран с общей статистикой и hero-логотипом

### Layout:

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│         ██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗██╗    ██╗        │
│         ██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝██║    ██║        │
│         ██║ █╗ ██║██║   ██║██████╔╝█████╔╝ ██║ █╗ ██║        │
│         ██║███╗██║██║   ██║██╔══██╗██╔═██╗ ██║███╗██║        │
│         ╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗╚███╔███╔╝        │
│          ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚══╝╚══╝         │
│                                                                │
│               АГРЕГАТОР ДАННЫХ IT РЫНКА                        │
│                                                                │
└────────────────────────────────────────────────────────────────┘

              ┌─ TOP SKILLS ─────────────────┐
              │ PostgreSQL (131)  Docker (120)│
              │ Python (118)  Kubernetes (107)│
              │ React (52)    TypeScript (53) │
              └──────────────────────────────┘

┌─ ОБЩАЯ СТАТИСТИКА ──────────────────────────────────────────┐
│                                                              │
│  TOTAL           REMOTE          SOURCES        LAST SYNC   │
│  14,354          62.7%           3/3            2 min ago   │
│  вакансий        (128 из 204)    ● ACTIVE                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Данные:**
- Total vacancies: `COUNT(*) FROM vacancies`
- Remote %: `(remote jobs / total with work_format) * 100`
- Top Skills: из `techStack` топ-6 по частоте
- Last Sync: `MAX(collected_at)`

---

## 2️⃣ [СТАТУС] МОНИТОРИНГ СИСТЕМЫ

**Цель:** Детальная статистика по категориям, work format, company types

### Layout:

```
[СТАТУС] МОНИТОРИНГ СИСТЕМЫ

┌─ КАТЕГОРИИ ВАКАНСИЙ ─────────────────────────────────────────┐
│                                                               │
│ BACKEND      ████████████░░░░  171  31.1%  (280-416K ₽)     │
│ DEVOPS       ██████░░░░░░░░░░   88  16.0%  (253-373K ₽)     │
│ QA           █████░░░░░░░░░░░   68  12.4%  (193-283K ₽)     │
│ OTHER        ████░░░░░░░░░░░░   58  10.5%  (128-211K ₽)     │
│ PRODUCT      ████░░░░░░░░░░░░   49   8.9%  (192-288K ₽)     │
│ FRONTEND     ███░░░░░░░░░░░░░   44   8.0%  (210-307K ₽)     │
│ FULLSTACK    ███░░░░░░░░░░░░░   34   6.2%  (212-316K ₽)     │
│ AI-ML        ██░░░░░░░░░░░░░░   26   4.7%  (313-475K ₽) 🤖  │
│ MOBILE       █░░░░░░░░░░░░░░░   12   2.2%  (258-382K ₽)     │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌─ WORK FORMAT DISTRIBUTION ───────────────────────────────────┐
│                                                               │
│ REMOTE       ████████████░░░  128  62.7%                     │
│ OFFICE       ████░░░░░░░░░░   46  22.5%                     │
│ HYBRID       ███░░░░░░░░░░░   30  14.7%                     │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌─ COMPANY TYPES ──────────────────────────────────────────────┐
│                                                               │
│ PRODUCT      ████████████░░░  Яндекс, VK, Ozon, МТС         │
│ OUTSOURCE    █████░░░░░░░░░  Andersen, EPAM, Luxoft         │
│ STARTUP      ██░░░░░░░░░░░░  <50 employees, Series A        │
│ CONSULTING   █░░░░░░░░░░░░░  McKinsey, Deloitte             │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌─ AI ADOPTION RATE ───────────────────────────────────────────┐
│                                                               │
│ Требуют AI/ML навыки:   75 вакансий (13.6%)                 │
│ AI-ML категория:        26 вакансий (100% с AI)             │
│ Backend с AI:           15 вакансий (8.8%)                   │
│ DevOps с AI:             2 вакансии (2.3%)                   │
│                                                               │
│ ██████████▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Данные:**
- Categories: `GROUP BY job_category` с count и avg salary
- Work Format: `GROUP BY work_format`
- Company Types: `GROUP BY company_type`
- AI Adoption: `requiresAi = true` по категориям

---

## 3️⃣ [ВАКАНСИИ] АКТУАЛЬНЫЕ ПРЕДЛОЖЕНИЯ

**Цель:** Список вакансий с фильтрами, использующий `descriptionShort`

### Layout:

```
[ВАКАНСИИ] АКТУАЛЬНЫЕ ПРЕДЛОЖЕНИЯ

Фильтры: [Все категории ▼] [Все уровни ▼] [Remote ✓] [AI Jobs ✗]

┌─ VACANCY #1 ─────────────────────────────────────────────────┐
│ Senior Backend Developer @ Ozon Tech                         │
│ Category: backend | Seniority: senior | Product | Remote    │
│                                                               │
│ Senior Backend Developer | Go, Kubernetes, PostgreSQL        │
│ 300-450k RUB | Product | Remote                              │
│ Требования: 5+ years • Microservices • High Load • ДМС      │
│                                                               │
│ AI Salary Rec: 320-480k ₽ (confidence: high)                │
│ "Senior Backend in Product 500+ typically 300-450k. Range   │
│  matches market expectations."                               │
│                                                               │
│ Tech Stack: Go (req), Kubernetes (req), PostgreSQL (req),   │
│             Redis (opt), Kafka (req)                         │
│                                                               │
│ [ПОДРОБНЕЕ] [СОХРАНИТЬ] [НА HH.RU →]                        │
└───────────────────────────────────────────────────────────────┘

┌─ VACANCY #2 ─────────────────────────────────────────────────┐
│ ML Engineer @ UZUM TECHNOLOGIES                              │
│ Category: ai-ml | Seniority: middle | Product | Hybrid      │
│                                                               │
│ ML Engineer | Python, PyTorch, MLOps                        │
│ 380-570k RUB | Product | Hybrid                              │
│ Требования: ML pipeline • Model deployment • English B2     │
│                                                               │
│ AI Salary Rec: 350-550k ₽ (confidence: medium)              │
│ "ML Engineer Middle+ in fast-growing product company        │
│  usually 350-550k. Salary matches senior level."            │
│                                                               │
│ Tech Stack: Python (req), PyTorch (req), Docker (req),      │
│             Kubernetes (opt), AWS (opt)                      │
│                                                               │
│ Benefits: Обучение, ДМС, Релокация, Опционы                 │
│                                                               │
│ [ПОДРОБНЕЕ] [СОХРАНИТЬ] [НА HH.RU →]                        │
└───────────────────────────────────────────────────────────────┘

Показано: 5 из 550 вакансий | [ЗАГРУЗИТЬ ЕЩЕ]
```

**Данные:**
- `descriptionShort`: краткое Twitter-style описание
- `techStack`: с маркерами (req/opt)
- `salaryRecommendation`: AI оценка + reasoning
- `benefits`: список бенефитов
- Фильтры по: `jobCategory`, `seniorityLevel`, `workFormat`, `requiresAi`

---

## 4️⃣ [ЗАРПЛАТЫ] АНАЛИЗ РЫНКА

**Цель:** Детальная зарплатная аналитика с перцентилями

### Layout:

```
[ЗАРПЛАТЫ] АНАЛИЗ РЫНКА

┌─ SALARY BY SENIORITY (Percentiles: P25 | P50 | P75) ────────┐
│                                                               │
│ JUNIOR       ▓▓░░░░░░░░  45K  -  65K  - 105K  ₽  (33 вак)  │
│ MIDDLE       ▓▓▓▓▓▓░░░░ 150K  - 178K  - 268K  ₽ (259 вак)  │
│ SENIOR       ▓▓▓▓▓▓▓▓░░ 240K  - 292K  - 434K  ₽ (172 вак)  │
│ LEAD         ▓▓▓▓▓▓▓▓▓▓ 300K  - 358K  - 526K  ₽  (79 вак)  │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌─ SALARY BY CATEGORY ─────────────────────────────────────────┐
│                                                               │
│ AI-ML        P50: 313K ₽  |  P75: 475K ₽  |  △ +68%        │
│ BACKEND      P50: 280K ₽  |  P75: 416K ₽  |  △ +49%        │
│ DEVOPS       P50: 253K ₽  |  P75: 373K ₽  |  △ +47%        │
│ MOBILE       P50: 258K ₽  |  P75: 382K ₽  |  △ +48%        │
│ FULLSTACK    P50: 212K ₽  |  P75: 316K ₽  |  △ +49%        │
│ FRONTEND     P50: 210K ₽  |  P75: 307K ₽  |  △ +46%        │
│ PRODUCT      P50: 192K ₽  |  P75: 288K ₽  |  △ +50%        │
│ QA           P50: 193K ₽  |  P75: 283K ₽  |  △ +47%        │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌─ TOP PAYING COMPANIES (P75 зарплата) ───────────────────────┐
│                                                               │
│ 1. UZUM TECHNOLOGIES   P75: 570K ₽  (Product, 5 вак)        │
│ 2. X5 Tech             P75: 538K ₽  (Product, 5 вак)        │
│ 3. МТС                 P75: 500K ₽  (Product, 5 вак)        │
│ 4. М.Видео-Эльдорадо   P75: 453K ₽  (Product, 8 вак)        │
│ 5. Ozon Банк           P75: 449K ₽  (Product, 7 вак)        │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌─ SALARY BY COMPANY TYPE ─────────────────────────────────────┐
│                                                               │
│ PRODUCT      P50: 310K ₽  |  Top: UZUM, X5, МТС             │
│ OUTSOURCE    P50: 220K ₽  |  Top: Andersen, EPAM            │
│ STARTUP      P50: 180K ₽  |  Top: EdTech, SaaS              │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌─ AI PREMIUM (зарплата с AI vs без AI) ──────────────────────┐
│                                                               │
│ С AI/ML навыками:   P50: 313K ₽  (+68% к медиане)          │
│ Без AI:             P50: 186K ₽                             │
│                                                               │
│ AI PREMIUM:         +127K ₽ (+68%)                          │
│                                                               │
└───────────────────────────────────────────────────────────────┘

💡 Insight: Вакансии с AI требованиями платят на 68% больше!
           100% вакансий в AI-ML категории требуют AI навыки.
```

**Данные (SQL запросы):**
```sql
-- Перцентили по seniority
SELECT seniority_level,
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY (salary_recommendation->>'min')::numeric) as p25,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY (salary_recommendation->>'min')::numeric) as p50,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY (salary_recommendation->>'max')::numeric) as p75
FROM vacancies
WHERE ai_enriched_at IS NOT NULL
GROUP BY seniority_level
```

---

## 5️⃣ [НАВЫКИ] ВОСТРЕБОВАННЫЕ ТЕХНОЛОГИИ

**Цель:** Детальный анализ tech stack с категоризацией

### Layout:

```
[НАВЫКИ] ВОСТРЕБОВАННЫЕ ТЕХНОЛОГИИ

┌─ TOP 20 TECHNOLOGIES (by demand) ────────────────────────────┐
│                                                               │
│  1. PostgreSQL    ████████████ 131  (98% required)  Tool    │
│  2. Docker        ███████████░ 120  (88% required)  Tool    │
│  3. Python        ███████████░ 118  (87% required)  Lang    │
│  4. Kubernetes    ██████████░░ 107  (84% required)  Tool    │
│  5. Linux         ████████░░░  94  (96% required)  Tool    │
│  6. SQL           ██████░░░░░  75 (100% required)  Lang    │
│  7. Git           █████░░░░░░  63  (94% required)  Tool    │
│  8. CI/CD         █████░░░░░░  60  (87% required)  Tool    │
│  9. Java          █████░░░░░░  58  (88% required)  Lang    │
│ 10. Kafka         ████░░░░░░░  54  (89% required)  Tool    │
│ 11. JavaScript    ████░░░░░░░  53  (96% required)  Lang    │
│ 12. TypeScript    ████░░░░░░░  53  (91% required)  Lang    │
│ 13. React         ████░░░░░░░  52  (83% required)  Framework│
│ 14. Redis         ████░░░░░░░  51  (84% required)  Tool    │
│ 15. RabbitMQ      ███░░░░░░░░  40  (95% required)  Tool    │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌─ BY CATEGORY ────────────────────────────────────────────────┐
│                                                               │
│ LANGUAGES                                                     │
│   Python        118 вакансий  P50: 280K ₽  (87% req)        │
│   JavaScript     53 вакансии  P50: 210K ₽  (96% req)        │
│   TypeScript     53 вакансии  P50: 220K ₽  (91% req)        │
│   Java           58 вакансий  P50: 290K ₽  (88% req)        │
│   SQL            75 вакансий  P50: 240K ₽ (100% req)        │
│                                                               │
│ FRAMEWORKS                                                    │
│   React          52 вакансии  P50: 210K ₽  (83% req)        │
│   Spring         40 вакансий  P50: 300K ₽  (85% req)        │
│   Django         28 вакансий  P50: 250K ₽  (90% req)        │
│                                                               │
│ TOOLS                                                         │
│   Docker        120 вакансий  P50: 260K ₽  (88% req)        │
│   Kubernetes    107 вакансий  P50: 270K ₽  (84% req)        │
│   Git            63 вакансии  P50: 240K ₽  (94% req)        │
│   PostgreSQL    131 вакансия  P50: 250K ₽  (98% req)        │
│                                                               │
│ CLOUD                                                         │
│   AWS            45 вакансий  P50: 280K ₽  (70% req)        │
│   GCP            25 вакансий  P50: 290K ₽  (65% req)        │
│   Azure          18 вакансий  P50: 270K ₽  (68% req)        │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌─ TRENDING SKILLS (AI/ML) ────────────────────────────────────┐
│                                                               │
│ PyTorch          18 вакансий  P50: 350K ₽                   │
│ TensorFlow       15 вакансий  P50: 340K ₽                   │
│ MLOps            12 вакансий  P50: 370K ₽                   │
│ LangChain        8 вакансий   P50: 400K ₽  🔥 NEW          │
│ RAG Systems      6 вакансий   P50: 420K ₽  🔥 HOT          │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌─ SENIORITY DISTRIBUTION ─────────────────────────────────────┐
│                                                               │
│ Junior      ██████░░░░░░░░░░░░   33   6.1%                  │
│ Middle      ████████████████░░  259  47.6%                  │
│ Senior      ██████████████░░░░  172  31.6%                  │
│ Lead        ██████░░░░░░░░░░░░   79  14.5%                  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Данные:**
```sql
-- Top technologies from techStack
SELECT
  tech->>'name' as technology,
  tech->>'category' as category,
  COUNT(*) as count,
  ROUND(COUNT(CASE WHEN (tech->>'required')::boolean = true THEN 1 END) * 100.0 / COUNT(*), 1) as required_pct
FROM vacancies
CROSS JOIN LATERAL jsonb_array_elements(tech_stack) as tech
WHERE ai_enriched_at IS NOT NULL
GROUP BY tech->>'name', tech->>'category'
HAVING COUNT(*) >= 10
ORDER BY count DESC
```

---

## 6️⃣ [ТРЕНДЫ] ДИНАМИКА ИЗМЕНЕНИЙ

**Цель:** AI adoption, benefits analysis, work format trends

### Layout:

```
[ТРЕНДЫ] ДИНАМИКА РЫНКА

┌─ AI ADOPTION RATE ───────────────────────────────────────────┐
│                                                               │
│ Требуют AI/ML навыки:   13.6% ▲ растёт                      │
│                                                               │
│ ██████████▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░        │
│                                                               │
│ Top AI Categories:                                            │
│   1. AI-ML         26 вакансий (100% с AI)                  │
│   2. Product        9 вакансий ( 18% с AI)                  │
│   3. Backend       15 вакансий (  9% с AI)                  │
│                                                               │
│ AI Premium: +127K ₽ (+68% к медиане без AI)                 │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌─ TOP BENEFITS (что предлагают компании) ────────────────────┐
│                                                               │
│  1. Обучение                  86 вакансий (15.6%)           │
│  2. ДМС                       44 вакансии  (8.0%)           │
│  3. Гибкий график             20 вакансий  (3.6%)           │
│  4. Удалённая работа          19 вакансий  (3.5%)           │
│  5. Карьерный рост            12 вакансий  (2.2%)           │
│  6. Международные проекты      8 вакансий  (1.5%)           │
│  7. Бонусы/Премии             10 вакансий  (1.8%)           │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌─ WORK FORMAT EVOLUTION ──────────────────────────────────────┐
│                                                               │
│ REMOTE       ████████████░░░  62.7%  (128 вак)  ▲          │
│ OFFICE       ████░░░░░░░░░░  22.5%  (46 вак)   ▼          │
│ HYBRID       ███░░░░░░░░░░░  14.7%  (30 вак)   ━          │
│                                                               │
│ 💡 63% вакансий предлагают удалённую работу!                │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌─ SALARY CONFIDENCE DISTRIBUTION ─────────────────────────────┐
│                                                               │
│ HIGH       ████░░░░░░░░░░░░  1.0%  (5 вак)                  │
│   → Зарплата указана и соответствует рынку                  │
│                                                               │
│ MEDIUM     ████████████████ 98.9% (519 вак)                 │
│   → Зарплата не указана, AI-оценка по рынку                 │
│                                                               │
│ LOW        █░░░░░░░░░░░░░░░  0.2%  (1 вак)                  │
│   → Зарплата сильно отличается от рынка                     │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌─ TOP COMPANIES BY VACANCIES ─────────────────────────────────┐
│                                                               │
│  1. Andersen            12 вакансий  (Outsource)            │
│  2. Ozon Tech           10 вакансий  (Product)              │
│  3. М.Видео-Эльдорадо    8 вакансий  (Product)              │
│  4. Ozon Банк            7 вакансий  (Product)              │
│  5. Альфа-Банк           6 вакансий  (Product)              │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 🎨 Дизайн-система

### Цвета (CSS Variables)

```css
--accent-cyan: #00FFFF      /* Неоновый голубой для заголовков */
--text-primary: #E0E0E0     /* Основной текст */
--text-secondary: #00FF00   /* Вторичный (зелёный) */
--text-muted: #888888       /* Приглушенный */
--bg-primary: #0A0A0A       /* Фон */
--bg-secondary: #1A1A1A     /* Вторичный фон */
--border-color: #333333     /* Границы */
```

### Typography

```css
font-family: 'JetBrains Mono', 'Fira Code', monospace
font-size: 12px (desktop), 10px (mobile)
line-height: 1.5
```

### Прогресс-бары

```
████████████░░░░░░░░  60%
▓▓▓▓▓▓▓▓░░░░          70% (насыщенный)
```

### Анимации

- Framer Motion: `staggerChildren` для списков
- `neon-glow` эффект для акцентов
- `pulse` для индикаторов активности

---

## 📊 SQL Queries для API

### Для SkillsView (Top Technologies)

```sql
SELECT
  tech->>'name' as technology,
  tech->>'category' as category,
  COUNT(*) as count,
  ROUND(AVG((salary_recommendation->>'min')::numeric)) as avg_min_salary,
  ROUND(COUNT(CASE WHEN (tech->>'required')::boolean = true THEN 1 END) * 100.0 / COUNT(*), 1) as required_pct
FROM vacancies
CROSS JOIN LATERAL jsonb_array_elements(tech_stack) as tech
WHERE ai_enriched_at IS NOT NULL
GROUP BY tech->>'name', tech->>'category'
HAVING COUNT(*) >= 5
ORDER BY count DESC
LIMIT 20
```

### Для SalariesView (Percentiles by Seniority)

```sql
SELECT
  seniority_level,
  COUNT(*) as count,
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY (salary_recommendation->>'min')::numeric) as p25,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY (salary_recommendation->>'min')::numeric) as p50,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY (salary_recommendation->>'max')::numeric) as p75,
  COUNT(CASE WHEN requires_ai = true THEN 1 END) as ai_jobs
FROM vacancies
WHERE ai_enriched_at IS NOT NULL AND seniority_level IS NOT NULL
GROUP BY seniority_level
ORDER BY
  CASE seniority_level
    WHEN 'junior' THEN 1
    WHEN 'middle' THEN 2
    WHEN 'senior' THEN 3
    WHEN 'lead' THEN 4
    WHEN 'principal' THEN 5
  END
```

### Для TrendsView (AI Adoption)

```sql
SELECT
  job_category,
  COUNT(*) as total,
  COUNT(CASE WHEN requires_ai = true THEN 1 END) as ai_jobs,
  ROUND(COUNT(CASE WHEN requires_ai = true THEN 1 END) * 100.0 / COUNT(*), 1) as ai_percentage,
  ROUND(AVG(CASE WHEN requires_ai = true THEN (salary_recommendation->>'min')::numeric END)) as ai_avg_salary,
  ROUND(AVG(CASE WHEN requires_ai = false THEN (salary_recommendation->>'min')::numeric END)) as no_ai_avg_salary
FROM vacancies
WHERE ai_enriched_at IS NOT NULL AND job_category IS NOT NULL
GROUP BY job_category
HAVING COUNT(*) >= 10
ORDER BY ai_percentage DESC
```

---

## 🚀 Implementation Priority

1. **Phase 1 (Week 1):**
   - Update API endpoints with new analytics queries
   - Update IAnalytics interface

2. **Phase 2 (Week 2):**
   - Redesign SkillsView with techStack data
   - Redesign SalariesView with percentiles

3. **Phase 3 (Week 3):**
   - Add VacanciesView with filters
   - Implement TrendsView

4. **Phase 4 (Week 4):**
   - Polish animations
   - Mobile optimization

---

**Дата:** 2026-01-26
**Обогащено вакансий:** 550
**Источник:** WorkWolk Analytics ETL Pipeline v0.2.0
