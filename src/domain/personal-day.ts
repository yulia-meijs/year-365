import type { PersonalDate } from './types'

const DAY_IN_MILLISECONDS = 86_400_000
export const EXPERIMENT_LENGTH_DAYS = 365
export const DEFAULT_START_DATE: PersonalDate = '2026-08-30'

function parsePersonalDate(value: PersonalDate): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) throw new Error(`Invalid Personal Day: ${value}`)

  const [, year, month, day] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  if (formatUtcDate(date) !== value) throw new Error(`Invalid Personal Day: ${value}`)
  return date
}

function formatUtcDate(date: Date): PersonalDate {
  return date.toISOString().slice(0, 10)
}

export function personalDateForInstant(instant: Date, timezone: string): PersonalDate {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant)
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value
  return `${get('year')}-${get('month')}-${get('day')}`
}

export function addPersonalDays(date: PersonalDate, days: number): PersonalDate {
  return formatUtcDate(new Date(parsePersonalDate(date).getTime() + days * DAY_IN_MILLISECONDS))
}

export function experimentDay(startDate: PersonalDate, date: PersonalDate): number | null {
  const offset = Math.round((parsePersonalDate(date).getTime() - parsePersonalDate(startDate).getTime()) / DAY_IN_MILLISECONDS)
  return offset >= 0 && offset < EXPERIMENT_LENGTH_DAYS ? offset + 1 : null
}

export function experimentProgress(startDate: PersonalDate, date: PersonalDate): number {
  const offset = Math.floor((parsePersonalDate(date).getTime() - parsePersonalDate(startDate).getTime()) / DAY_IN_MILLISECONDS)
  return Math.min(100, Math.max(0, ((offset + 1) / EXPERIMENT_LENGTH_DAYS) * 100))
}

export function experimentEndDate(startDate: PersonalDate): PersonalDate {
  return addPersonalDays(startDate, EXPERIMENT_LENGTH_DAYS - 1)
}