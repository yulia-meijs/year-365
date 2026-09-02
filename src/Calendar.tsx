import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { CalendarDays, ChevronLeft, LocateFixed } from 'lucide-react'
import { db } from './data/database'
import { buildCalendarDays, type CalendarDay, type CalendarStatus } from './domain/calendar'
import type { PersonalDate, YearExperiment } from './domain/types'

interface CalendarProps {
  experiment: YearExperiment
  today: PersonalDate
  onBack: () => void
  onOpenDay: (date: PersonalDate) => void
}

type CalendarFilter = 'all' | 'recorded' | 'partial' | 'alcohol-free' | 'alcohol-recorded' | 'sport'

const statusLabels: Record<CalendarStatus, string> = {
  unknown: 'Not recorded',
  partial: 'Partial check-in',
  'alcohol-free': 'Alcohol-free',
  'alcohol-recorded': 'Alcohol recorded',
}

const filters: { value: CalendarFilter; label: string }[] = [
  { value: 'all', label: 'All days' },
  { value: 'recorded', label: 'Recorded' },
  { value: 'partial', label: 'Partial' },
  { value: 'alcohol-free', label: 'Alcohol-free' },
  { value: 'alcohol-recorded', label: 'Alcohol recorded' },
  { value: 'sport', label: 'Sport' },
]

function monthKey(date: PersonalDate): string {
  return date.slice(0, 7)
}

function monthName(key: string): string {
  return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${key}-01T12:00:00Z`))
}

function groupByMonth(days: CalendarDay[]): Map<string, CalendarDay[]> {
  const months = new Map<string, CalendarDay[]>()
  for (const day of days) {
    const key = monthKey(day.date)
    months.set(key, [...(months.get(key) ?? []), day])
  }
  return months
}

function dayLabel(day: CalendarDay): string {
  const date = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${day.date}T12:00:00Z`))
  const sport = day.sport ? `; sport: ${day.sport}${day.sportMinutes !== undefined ? `, ${day.sportMinutes} minutes` : ''}` : ''
  return `${date}, Day ${day.dayNumber}: ${day.isFuture ? 'Future day' : statusLabels[day.status]}${sport}`
}

export function Calendar({ experiment, today, onBack, onOpenDay }: CalendarProps) {
  const [filter, setFilter] = useState<CalendarFilter>('all')
  const todayButtonRef = useRef<HTMLButtonElement>(null)
  const checkIns = useLiveQuery(() => db.dailyCheckIns.where('experimentId').equals(experiment.id).toArray(), [experiment.id])
  const days = buildCalendarDays(experiment.startDate, today, checkIns ?? [])
  const months = groupByMonth(days)
  const hasToday = days.some((day) => day.date === today)

  function revealToday(shouldFocus: boolean, behavior: ScrollBehavior) {
    const button = todayButtonRef.current
    if (!button) return
    button.scrollIntoView({ behavior, block: 'center', inline: 'center' })
    if (shouldFocus) button.focus({ preventScroll: true })
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => revealToday(false, 'auto'))
    return () => window.cancelAnimationFrame(frame)
  }, [today])

  function matchesFilter(day: CalendarDay): boolean {
    if (filter === 'all') return true
    if (filter === 'recorded') return day.status !== 'unknown'
    if (filter === 'sport') return Boolean(day.sport || day.sportMinutes !== undefined)
    return day.status === filter
  }

  return (
    <div className="calendar-page">
      <header className="calendar-header">
        <button className="icon-button" onClick={onBack} aria-label="Back to Today"><ChevronLeft aria-hidden="true" /></button>
        <div><p className="eyebrow">Your Year Experiment</p><h1>Calendar</h1></div>
        <button className="calendar-today-button" type="button" aria-label="Jump to today" disabled={!hasToday} onClick={() => revealToday(true, 'smooth')}><LocateFixed aria-hidden="true" /><span>Today</span></button>
      </header>
      <main className="calendar-content">
        <section className="calendar-intro" aria-labelledby="calendar-title">
          <div><CalendarDays aria-hidden="true" /><p className="step-label">365 days, held together</p><h2 id="calendar-title">A record, not a scorecard.</h2></div>
          <p>Observed days, unfinished notes, and open space all belong to the year.</p>
        </section>

        <div className="calendar-legend" aria-label="Calendar status legend">
          {Object.entries(statusLabels).map(([status, label]) => <span key={status}><i className={`status-dot ${status}`} />{label}</span>)}
          <span><i className="status-bar sport" />Sport progress</span>
        </div>

        <div className="calendar-filters" role="group" aria-label="Filter calendar days">
          {filters.map(({ value, label }) => <button type="button" key={value} className={filter === value ? 'selected' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
        </div>

        <div className="months-grid">
          {Array.from(months, ([key, monthDays]) => {
            const firstWeekday = new Date(`${monthDays[0].date}T12:00:00Z`).getUTCDay()
            return (
              <section className="calendar-month" key={key} aria-labelledby={`month-${key}`}>
                <h3 id={`month-${key}`}>{monthName(key)}</h3>
                <div className="weekday-row" aria-hidden="true">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}</div>
                <div className="month-days">
                  {Array.from({ length: firstWeekday }, (_, index) => <span className="day-spacer" key={`spacer-${index}`} />)}
                  {monthDays.map((day) => (
                    <button
                      type="button"
                      ref={day.date === today ? todayButtonRef : undefined}
                      key={day.date}
                      className={`calendar-day ${day.status} ${day.sport || day.sportMinutes !== undefined ? 'has-sport' : ''} ${day.date === today ? 'today' : ''} ${!matchesFilter(day) ? 'filtered' : ''}`}
                      aria-label={dayLabel(day)}
                      disabled={day.isFuture}
                      onClick={() => onOpenDay(day.date)}
                    >
                      <span>{Number(day.date.slice(8))}</span>
                      <i aria-hidden="true" />
                      {(day.sport || day.sportMinutes !== undefined) && <b className="sport-progress" aria-hidden="true" style={{ width: `${day.sportMinutes === undefined ? 18 : Math.min(100, Math.max(8, day.sportMinutes / 60 * 100))}%` }} />}
                    </button>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </main>
    </div>
  )
}