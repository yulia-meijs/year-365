import { addPersonalDays, EXPERIMENT_LENGTH_DAYS } from './personal-day'
import type { DailyCheckIn, PersonalDate } from './types'

export type CalendarStatus = 'unknown' | 'partial' | 'alcohol-free' | 'alcohol-recorded'

export interface CalendarDay {
  date: PersonalDate
  dayNumber: number
  status: CalendarStatus
  sport?: string
  sportMinutes?: number
  isFuture: boolean
}

export function calendarStatus(checkIn?: DailyCheckIn): CalendarStatus {
  if (!checkIn || checkIn.alcoholFree === undefined) return checkIn ? 'partial' : 'unknown'
  if (checkIn.status === 'draft') return 'partial'
  return checkIn.alcoholFree ? 'alcohol-free' : 'alcohol-recorded'
}

export function buildCalendarDays(
  startDate: PersonalDate,
  today: PersonalDate,
  checkIns: DailyCheckIn[],
): CalendarDay[] {
  const checkInsByDate = new Map(checkIns.map((checkIn) => [checkIn.personalDate, checkIn]))
  return Array.from({ length: EXPERIMENT_LENGTH_DAYS }, (_, index) => {
    const date = addPersonalDays(startDate, index)
    const checkIn = checkInsByDate.get(date)
    return {
      date,
      dayNumber: index + 1,
      status: calendarStatus(checkIn),
      sport: checkIn?.sport,
      sportMinutes: checkIn?.sportMinutes,
      isFuture: date > today,
    }
  })
}