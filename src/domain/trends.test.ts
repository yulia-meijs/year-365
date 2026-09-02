import { alcoholTrend, numericTrend, summarizeTrend, trendDates } from './trends'
import type { DailyCheckIn } from './types'

function checkIn(personalDate: string, values: Partial<DailyCheckIn>): DailyCheckIn {
  return {
    id: `primary:${personalDate}`,
    experimentId: 'primary',
    personalDate,
    status: 'complete',
    updatedAt: `${personalDate}T12:00:00.000Z`,
    ...values,
  }
}

describe('trend model', () => {
  it('limits trailing ranges to experiment days through today', () => {
    expect(trendDates('2026-08-30', '2026-09-02', 7)).toEqual([
      '2026-08-30', '2026-08-31', '2026-09-01', '2026-09-02',
    ])
    expect(trendDates('2026-09-03', '2026-09-02', 7)).toEqual([])
    expect(trendDates('2026-08-30', '2027-09-05', 7)).toEqual([
      '2027-08-23', '2027-08-24', '2027-08-25', '2027-08-26',
      '2027-08-27', '2027-08-28', '2027-08-29',
    ])
  })

  it('keeps unknown numeric observations as gaps rather than zero', () => {
    const points = numericTrend('2026-08-30', '2026-09-02', 7, [
      checkIn('2026-08-30', { energy: 6 }),
      checkIn('2026-09-02', { energy: 8 }),
    ], 'energy')
    expect(points.map((point) => point.value)).toEqual([6, null, null, 8])
    expect(summarizeTrend(points)).toEqual({ count: 2, average: 7, latest: 8, minimum: 6, maximum: 8 })
  })

  it('distinguishes unknown, alcohol-free, and alcohol-recorded observations', () => {
    const points = alcoholTrend('2026-08-30', '2026-09-01', 7, [
      checkIn('2026-08-30', { alcoholFree: true }),
      checkIn('2026-09-01', { alcoholFree: false }),
    ])
    expect(points.map((point) => point.value)).toEqual([1, null, 0])
  })
})