// Shared types for WorkWolk
// Add common types here as the project grows

export interface Vacancy {
  id: number
  title: string
  company: string
  salaryFrom: number | null
  salaryTo: number | null
  currency: string | null
  location: string | null
  experience: string | null
  employment: string | null
  schedule: string | null
  skills: string[]
  description: string | null
  url: string
  externalId: string
  sourceId: number
  publishedAt: Date | null
  scrapedAt: Date
}

export interface Source {
  id: number
  name: string
  baseUrl: string
  isActive: boolean
}
