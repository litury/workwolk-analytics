/**
 * Seed данные для job_categories
 * 35 IT категорий основанных на исследовании рынка 2026:
 * - HH.ru API Professional Roles
 * - LinkedIn Jobs on the Rise 2026
 * - O*NET Taxonomy
 */

import { NewJobCategory } from '../schema/jobCategories';

export const jobCategoriesSeed: NewJobCategory[] = [
  // ============================================
  // A. РАЗРАБОТКА (14 категорий)
  // ============================================

  // Frontend (4)
  {
    slug: 'frontend-react',
    name: 'React Frontend Developer',
    displayName: 'React / Next.js',
    searchKeywords: ['react', 'nextjs', 'next.js', 'redux', 'javascript', 'typescript'],
    excludeKeywords: ['backend', 'node.js server', 'серверный'],
    category: 'frontend',
    hhRoleId: 96, // Programmer/Developer
    priority: 1, // Высокий (40% frontend рынка)
    description: '40% frontend разработчиков используют React. Next.js, Redux, TypeScript.',
  },
  {
    slug: 'frontend-vue',
    name: 'Vue.js Frontend Developer',
    displayName: 'Vue / Nuxt',
    searchKeywords: ['vue', 'vuejs', 'vue.js', 'nuxt', 'vuex', 'composition api', 'pinia'],
    excludeKeywords: ['backend'],
    category: 'frontend',
    hhRoleId: 96,
    priority: 1,
    description: 'Vue.js, Nuxt, Vuex, Pinia, Composition API',
  },
  {
    slug: 'frontend-angular',
    name: 'Angular Frontend Developer',
    displayName: 'Angular',
    searchKeywords: ['angular', 'rxjs', 'ngrx', 'typescript angular'],
    excludeKeywords: ['backend', 'angularjs'],
    category: 'frontend',
    hhRoleId: 96,
    priority: 2,
    description: 'Angular, RxJS, NgRx, TypeScript',
  },
  {
    slug: 'frontend-general',
    name: 'Frontend Developer',
    displayName: 'HTML/CSS/JS',
    searchKeywords: ['html', 'css', 'javascript', 'верстальщик', 'frontend developer', 'фронтенд'],
    excludeKeywords: ['react', 'vue', 'angular', 'backend'],
    category: 'frontend',
    hhRoleId: 96,
    priority: 2,
    description: 'HTML, CSS, JavaScript без специфичного фреймворка',
  },

  // Backend (5)
  {
    slug: 'backend-node',
    name: 'Node.js Backend Developer',
    displayName: 'Node.js / Express / NestJS',
    searchKeywords: ['node.js', 'nodejs', 'express', 'nestjs', 'fastify', 'backend node'],
    excludeKeywords: [],
    category: 'backend',
    hhRoleId: 96,
    priority: 1,
    description: 'Node.js, Express, NestJS, Fastify, TypeScript backend',
  },
  {
    slug: 'backend-python',
    name: 'Python Backend Developer',
    displayName: 'Python / Django / FastAPI',
    searchKeywords: ['python', 'django', 'fastapi', 'flask', 'sqlalchemy', 'backend python'],
    excludeKeywords: [],
    category: 'backend',
    hhRoleId: 96,
    priority: 1,
    description: 'Python, Django, FastAPI, Flask, SQLAlchemy',
  },
  {
    slug: 'backend-go',
    name: 'Go Backend Developer',
    displayName: 'Go / Golang',
    searchKeywords: ['golang', 'go developer', ' go ', 'backend go', 'go engineer'],
    excludeKeywords: [],
    category: 'backend',
    hhRoleId: 96,
    priority: 1,
    description: 'Go/Golang backend разработка',
  },
  {
    slug: 'backend-java',
    name: 'Java Backend Developer',
    displayName: 'Java / Spring',
    searchKeywords: ['java', 'spring', 'kotlin', 'spring boot', 'backend java'],
    excludeKeywords: ['android'],
    category: 'backend',
    hhRoleId: 96,
    priority: 1,
    description: 'Java, Spring, Kotlin, Spring Boot',
  },
  {
    slug: 'backend-php',
    name: 'PHP Backend Developer',
    displayName: 'PHP / Laravel',
    searchKeywords: ['php', 'laravel', 'symfony', 'yii', 'backend php'],
    excludeKeywords: [],
    category: 'backend',
    hhRoleId: 96,
    priority: 2,
    description: 'PHP, Laravel, Symfony, Yii',
  },

  // Fullstack (2)
  {
    slug: 'fullstack-js',
    name: 'Fullstack JavaScript Developer',
    displayName: 'Fullstack JS (MERN/MEAN)',
    searchKeywords: ['fullstack', 'full stack', 'full-stack', 'mern', 'mean', 'mevn'],
    excludeKeywords: [],
    category: 'fullstack',
    hhRoleId: 96,
    priority: 2,
    description: 'MERN/MEAN/MEVN stack: React/Vue/Angular + Node.js',
  },
  {
    slug: 'fullstack-python',
    name: 'Fullstack Python Developer',
    displayName: 'Fullstack Python',
    searchKeywords: ['fullstack python', 'django react', 'fastapi vue', 'python fullstack'],
    excludeKeywords: [],
    category: 'fullstack',
    hhRoleId: 96,
    priority: 2,
    description: 'Python backend + Frontend (React/Vue)',
  },

  // Mobile (3)
  {
    slug: 'mobile-ios',
    name: 'iOS Developer',
    displayName: 'iOS / Swift',
    searchKeywords: ['ios', 'swift', 'swiftui', 'objective-c', 'xcode', 'ios developer'],
    excludeKeywords: [],
    category: 'mobile',
    hhRoleId: 96,
    priority: 2,
    description: 'iOS, Swift, SwiftUI, Objective-C, Xcode',
  },
  {
    slug: 'mobile-android',
    name: 'Android Developer',
    displayName: 'Android / Kotlin',
    searchKeywords: ['android', 'kotlin android', 'java android', 'jetpack', 'android developer'],
    excludeKeywords: [],
    category: 'mobile',
    hhRoleId: 96,
    priority: 2,
    description: 'Android, Kotlin, Java, Jetpack Compose',
  },
  {
    slug: 'mobile-crossplatform',
    name: 'Cross-platform Mobile Developer',
    displayName: 'React Native / Flutter',
    searchKeywords: ['react native', 'flutter', 'expo', 'cross-platform', 'мобильный разработчик'],
    excludeKeywords: [],
    category: 'mobile',
    hhRoleId: 96,
    priority: 2,
    description: 'React Native, Flutter, Expo',
  },

  // ============================================
  // B. DATA & AI (7 категорий) - ПРИОРИТЕТ 2026
  // ============================================

  // Аналитика (3)
  {
    slug: 'data-analyst',
    name: 'Data Analyst',
    displayName: 'Data / BI Analyst',
    searchKeywords: ['data analyst', 'bi analyst', 'аналитик данных', 'power bi', 'tableau', 'аналитика'],
    excludeKeywords: [],
    category: 'data',
    hhRoleId: 156, // BI Analyst
    priority: 1, // +31% вакансий
    description: 'Data Analyst, BI Analyst. Зарплата ~104,000₽. +31% вакансий.',
  },
  {
    slug: 'business-analyst',
    name: 'Business Analyst',
    displayName: 'Бизнес-аналитик',
    searchKeywords: ['business analyst', 'бизнес-аналитик', 'бизнес аналитик', 'ba '],
    excludeKeywords: [],
    category: 'data',
    hhRoleId: 150, // Business Analyst
    priority: 1,
    description: 'Бизнес-аналитик. Зарплата ~121,000₽.',
  },
  {
    slug: 'system-analyst',
    name: 'System Analyst',
    displayName: 'Системный аналитик',
    searchKeywords: ['системный аналитик', 'system analyst', 'sa ', 'архитектор решений', 'системный'],
    excludeKeywords: [],
    category: 'data',
    hhRoleId: 148, // System Analyst
    priority: 1,
    description: 'Системный аналитик. Зарплата ~173,300₽.',
  },

  // AI/ML (4 категории - МАКСИМАЛЬНЫЙ ПРИОРИТЕТ)
  {
    slug: 'ai-data-scientist',
    name: 'Data Scientist / ML Engineer',
    displayName: 'Data Science & ML',
    searchKeywords: ['data scientist', 'machine learning', 'ml engineer', 'mlops', 'data science'],
    excludeKeywords: [],
    category: 'ai',
    hhRoleId: 165, // Data Scientist
    priority: 0, // МАКСИМУМ! +125% вакансий, 245,800₽
    description: 'Data Scientist, ML Engineer. Зарплата 245,800₽. +125% вакансий. 45% analytics вакансий упоминают AI.',
  },
  {
    slug: 'ai-engineer',
    name: 'AI Engineer',
    displayName: 'AI / LLM Engineer',
    searchKeywords: ['ai engineer', 'llm', 'gpt', 'chatbot', 'langchain', 'rag', 'искусственный интеллект'],
    excludeKeywords: [],
    category: 'ai',
    hhRoleId: null,
    priority: 0, // МАКСИМУМ! Новая роль 2026
    description: 'AI Engineer, LLM, GPT, RAG. Рост на 50% AI/ML должностей за год.',
  },
  {
    slug: 'ai-computer-vision',
    name: 'Computer Vision Engineer',
    displayName: 'Computer Vision / CV',
    searchKeywords: ['computer vision', 'opencv', 'yolo', 'image processing', 'cv engineer', 'компьютерное зрение'],
    excludeKeywords: [],
    category: 'ai',
    hhRoleId: null,
    priority: 1,
    description: 'Computer Vision, OpenCV, YOLO, Image Processing',
  },
  {
    slug: 'ai-nlp',
    name: 'NLP Engineer',
    displayName: 'NLP / Text Analytics',
    searchKeywords: ['nlp', 'natural language processing', 'text mining', 'bert', 'transformers', 'обработка текста'],
    excludeKeywords: [],
    category: 'ai',
    hhRoleId: null,
    priority: 1,
    description: 'NLP, Natural Language Processing, BERT, Transformers',
  },

  // ============================================
  // C. INFRASTRUCTURE & OPS (6 категорий)
  // ============================================

  {
    slug: 'devops-engineer',
    name: 'DevOps Engineer',
    displayName: 'DevOps',
    searchKeywords: ['devops', 'ci/cd', 'jenkins', 'gitlab ci', 'github actions', 'devops engineer'],
    excludeKeywords: [],
    category: 'devops',
    hhRoleId: 160, // DevOps Engineer
    priority: 0, // МАКСИМУМ! +133% вакансий, 225,000₽
    description: 'DevOps Engineer. Зарплата 225,000₽. +133% вакансий.',
  },
  {
    slug: 'cloud-engineer',
    name: 'Cloud Engineer',
    displayName: 'AWS / GCP / Azure',
    searchKeywords: ['cloud engineer', 'aws', 'gcp', 'azure', 'terraform', 'облачный инженер'],
    excludeKeywords: [],
    category: 'devops',
    hhRoleId: null,
    priority: 1,
    description: 'Cloud Engineer: AWS, GCP, Azure, Terraform',
  },
  {
    slug: 'sre-platform',
    name: 'SRE / Platform Engineer',
    displayName: 'SRE / Platform',
    searchKeywords: ['sre', 'site reliability', 'platform engineer', 'observability', 'sre engineer'],
    excludeKeywords: [],
    category: 'devops',
    hhRoleId: null,
    priority: 1,
    description: 'SRE, Site Reliability Engineering, Platform Engineering, Observability',
  },
  {
    slug: 'system-admin',
    name: 'System Administrator',
    displayName: 'SysAdmin',
    searchKeywords: ['системный администратор', 'sysadmin', 'linux admin', 'windows server', 'администратор'],
    excludeKeywords: [],
    category: 'devops',
    hhRoleId: 113, // System Administrator
    priority: 2,
    description: 'Системный администратор, Linux, Windows Server',
  },
  {
    slug: 'network-engineer',
    name: 'Network Engineer',
    displayName: 'Network / Cisco',
    searchKeywords: ['network engineer', 'сетевой инженер', 'cisco', 'routing', 'сетевой'],
    excludeKeywords: [],
    category: 'devops',
    hhRoleId: 112, // Network Engineer
    priority: 2,
    description: 'Сетевой инженер, Cisco, Routing, Switching',
  },
  {
    slug: 'security-engineer',
    name: 'Security Engineer',
    displayName: 'InfoSec / Cybersecurity',
    searchKeywords: ['security engineer', 'информационная безопасность', 'infosec', 'pentester', 'безопасность'],
    excludeKeywords: [],
    category: 'devops',
    hhRoleId: null,
    priority: 1,
    description: 'InfoSec, Cybersecurity, Pentesting, Информационная безопасность',
  },

  // ============================================
  // D. QA & TESTING (3 категории)
  // ============================================

  {
    slug: 'qa-manual',
    name: 'Manual QA Tester',
    displayName: 'Manual QA',
    searchKeywords: ['manual qa', 'manual tester', 'тестировщик', 'функциональное тестирование', 'qa manual'],
    excludeKeywords: ['automation', 'автоматизация'],
    category: 'qa',
    hhRoleId: 124, // QA Tester
    priority: 2,
    description: 'Manual QA Tester. Зарплата ~104,000₽.',
  },
  {
    slug: 'qa-automation',
    name: 'Automation QA Engineer',
    displayName: 'QA Automation',
    searchKeywords: ['automation qa', 'selenium', 'cypress', 'playwright', 'автотесты', 'qa automation'],
    excludeKeywords: [],
    category: 'qa',
    hhRoleId: 124,
    priority: 1,
    description: 'QA Automation: Selenium, Cypress, Playwright',
  },
  {
    slug: 'qa-performance',
    name: 'Performance Test Engineer',
    displayName: 'Performance Testing',
    searchKeywords: ['performance testing', 'jmeter', 'gatling', 'load testing', 'нагрузочное тестирование'],
    excludeKeywords: [],
    category: 'qa',
    hhRoleId: 124,
    priority: 2,
    description: 'Performance Testing, Load Testing: JMeter, Gatling',
  },

  // ============================================
  // E. PRODUCT & DESIGN (3 категории)
  // ============================================

  {
    slug: 'product-manager',
    name: 'Product Manager',
    displayName: 'Product Manager',
    searchKeywords: ['product manager', 'продакт', 'product owner', 'po ', 'pm '],
    excludeKeywords: [],
    category: 'product',
    hhRoleId: 73, // Product Manager
    priority: 2,
    description: 'Product Manager, Product Owner',
  },
  {
    slug: 'ui-ux-designer',
    name: 'UI/UX Designer',
    displayName: 'UI/UX Design',
    searchKeywords: ['ui/ux', 'ui designer', 'ux designer', 'figma', 'web design', 'дизайнер'],
    excludeKeywords: [],
    category: 'product',
    hhRoleId: 34, // Designer/Artist
    priority: 2,
    description: 'UI/UX Designer, Figma, Web Design',
  },
  {
    slug: 'product-analyst',
    name: 'Product Analyst',
    displayName: 'Product Analytics',
    searchKeywords: ['product analyst', 'продуктовый аналитик', 'amplitude', 'mixpanel', 'product analytics'],
    excludeKeywords: [],
    category: 'product',
    hhRoleId: 164, // Product Analyst
    priority: 2,
    description: 'Product Analyst: Amplitude, Mixpanel, Product Analytics',
  },

  // ============================================
  // F. СПЕЦИАЛИЗИРОВАННЫЕ (2 категории)
  // ============================================

  {
    slug: 'game-dev',
    name: 'Game Developer',
    displayName: 'GameDev / Unity / Unreal',
    searchKeywords: ['unity', 'unreal engine', 'game developer', 'gamedev', 'c# unity', 'разработчик игр'],
    excludeKeywords: [],
    category: 'specialized',
    hhRoleId: 25, // Game Designer
    priority: 3, // LOW (niche)
    description: 'Game Development: Unity, Unreal Engine',
  },
  {
    slug: 'blockchain-web3',
    name: 'Blockchain / Web3 Developer',
    displayName: 'Blockchain / Web3',
    searchKeywords: ['blockchain', 'web3', 'solidity', 'ethereum', 'smart contract', 'блокчейн'],
    excludeKeywords: [],
    category: 'specialized',
    hhRoleId: null,
    priority: 3, // LOW (niche)
    description: 'Blockchain, Web3, Solidity, Ethereum, Smart Contracts',
  },
];
