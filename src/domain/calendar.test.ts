import { buildCalendarDays, calendarStatus } from './calendar'
import type { DailyCheckIn } from './types'

function checkIn(overrides: Partial<DailyCheckIn>): DailyCheckIn {
  return {
    id: 'primary:2026-08-30',
    experimentId: 'primary',
    personalDate: '2026-08-30',
    status: 'complete',
    updatedAt: '2026-08-30T12:00:00.000Z',
    ...overrides,
  }
}

describe('calendar model', () => {
  it('distinguishes unknown, partial, alcohol-free, and alcohol-recorded days', () => {
    expect(calendarStatus()).toBe('unknown')
    expect(calendarStatus(checkIn({ status: 'draft', alcoholFree: true }))).toBe('partial')
    expect(calendarStatus(checkIn({ alcoholFree: true }))).toBe('alcohol-free')
    expect(calendarStatus(checkIn({ alcoholFree: false }))).toBe('alcohol-recorded')
  })

  it('creates all 365 experiment days and marks only later dates as future', () => {
    const days = buildCalendarDays('2026-08-30', '2026-08-31', [])
    expect(days).toHaveLength(365)
    expect(days[0]).toMatchObject({ date: '2026-08-30', dayNumber: 1, isFuture: false })
    expect(days[1]).toMatchObject({ date: '2026-08-31', dayNumber: 2, isFuture: false })
    expect(days[2].isFuture).toBe(true)
    expect(days[364].date).toBe('2027-08-29')
  })
})