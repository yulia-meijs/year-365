import {
  DEFAULT_START_DATE,
  experimentDay,
  experimentEndDate,
  experimentProgress,
  personalDateForInstant,
} from './personal-day'

describe('Year Experiment date rules', () => {
  it('numbers the accepted experiment boundaries', () => {
    expect(experimentDay(DEFAULT_START_DATE, '2026-08-30')).toBe(1)
    expect(experimentDay(DEFAULT_START_DATE, '2027-08-29')).toBe(365)
    expect(experimentEndDate(DEFAULT_START_DATE)).toBe('2027-08-29')
  })

  it('does not assign days outside the experiment', () => {
    expect(experimentDay(DEFAULT_START_DATE, '2026-08-29')).toBeNull()
    expect(experimentDay(DEFAULT_START_DATE, '2027-08-30')).toBeNull()
  })

  it('clamps progress to the experiment range', () => {
    expect(experimentProgress(DEFAULT_START_DATE, '2026-08-29')).toBe(0)
    expect(experimentProgress(DEFAULT_START_DATE, '2026-08-30')).toBeCloseTo(100 / 365)
    expect(experimentProgress(DEFAULT_START_DATE, '2027-08-29')).toBe(100)
    expect(experimentProgress(DEFAULT_START_DATE, '2028-01-01')).toBe(100)
  })

  it('resolves a Personal Day in the configured timezone', () => {
    const instant = new Date('2026-08-30T00:30:00.000Z')
    expect(personalDateForInstant(instant, 'Europe/London')).toBe('2026-08-30')
    expect(personalDateForInstant(instant, 'America/Los_Angeles')).toBe('2026-08-29')
  })
})