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
  reflection?: string
  updatedAt: string
}