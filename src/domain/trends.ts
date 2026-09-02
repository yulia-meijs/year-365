import { addPersonalDays, experimentEndDate } from './personal-day'
import type { DailyCheckIn, PersonalDate } from './types'

export type TrendRange = 7 | 30 | 90 | 365
export type NumericMetric = 'sleepHours' | 'energy' | 'mood' | 'stress'

export interface TrendPoint {
  date: PersonalDate
  value: number | null
}

export interface TrendSummary {
  count: number
  average?: number
  latest?: number
  minimum?: number
  maximum?: number
}

export function trendDates(startDate: PersonalDate, today: PersonalDate, range: TrendRange): PersonalDate[] {
  const finalDate = experimentEndDate(startDate)
  const effectiveToday = today < finalDate ? today : finalDate
  const rangeStart = addPersonalDays(effectiveToday, -(range - 1))
  const firstDate = rangeStart > startDate ? rangeStart : startDate
  if (firstDate > effectiveToday || today < startDate) return []

  const dates: PersonalDate[] = []
  for (let date = firstDate; date <= effectiveToday && dates.length < range; date = addPersonalDays(date, 1)) {
    dates.push(date)
  }
  return dates
}

export function numericTrend(
  startDate: PersonalDate,
  today: PersonalDate,
  range: TrendRange,
  checkIns: DailyCheckIn[],
  metric: NumericMetric,
): TrendPoint[] {
  const values = new Map(checkIns.map((checkIn) => [checkIn.personalDate, checkIn[metric]]))
  return trendDates(startDate, today, range).map((date) => ({ date, value: values.get(date) ?? null }))
}

export function alcoholTrend(
  startDate: PersonalDate,
  today: PersonalDate,
  range: TrendRange,
  checkIns: DailyCheckIn[],
): TrendPoint[] {
  const values = new Map(checkIns.map((checkIn) => [checkIn.personalDate, checkIn.alcoholFree]))
  return trendDates(startDate, today, range).map((date) => {
    const alcoholFree = values.get(date)
    return { date, value: alcoholFree === undefined ? null : alcoholFree ? 1 : 0 }
  })
}

export function summarizeTrend(points: TrendPoint[]): TrendSummary {
  const values = points.flatMap((point) => point.value === null ? [] : [point.value])
  if (values.length === 0) return { count: 0 }
  return {
    count: values.length,
    average: values.reduce((total, value) => total + value, 0) / values.length,
    latest: values.at(-1),
    minimum: Math.min(...values),
    maximum: Math.max(...values),
  }
}