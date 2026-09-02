export type PersonalDate = string

export interface LocalProfile {
  id: 'local'
  timezone: string
  createdAt: string
}

export interface YearExperiment {
  id: 'primary'
  profileId: LocalProfile['id']
  startDate: PersonalDate
  createdAt: string
}

export interface DailyCheckIn {
  id: string
  experimentId: YearExperiment['id']
  personalDate: PersonalDate
  status: 'draft' | 'complete'
  alcoholFree?: boolean
  sleepHours?: number
  energy?: number
  mood?: number
  stress?: number
  sport?: string
  sportMinutes?: number
  reflection?: string
  updatedAt: string
}

export const projectCategories = ['Creative', 'Learning', 'Health', 'Travel', 'Home', 'Career', 'Relationships', 'Personal', 'Other'] as const
export type ProjectCategory = typeof projectCategories[number]
export type ProjectStatus = 'idea' | 'active' | 'paused' | 'complete'

export interface Project {
  id: string
  experimentId: YearExperiment['id']
  name: string
  category: ProjectCategory
  description?: string
  startDate?: PersonalDate
  targetDate?: PersonalDate
  status: ProjectStatus
  notes?: string
  investedMinutes: number
  createdAt: string
  updatedAt: string
}

export interface ProjectMilestone {
  id: string
  projectId: Project['id']
  title: string
  completed: boolean
  completedAt?: string
}

export type InterestStatus = 'idea' | 'interested' | 'tried' | 'loved' | 'not-for-me'

export interface Interest {
  id: string
  experimentId: YearExperiment['id']
  name: string
  category: ProjectCategory
  status: InterestStatus
  createdAt: string
  updatedAt: string
}

export interface LifeRule {
  id: string
  experimentId: YearExperiment['id']
  sentence: string
  position: number
  createdAt: string
  updatedAt: string
}