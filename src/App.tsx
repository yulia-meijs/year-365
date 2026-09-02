import { lazy, Suspense, useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { CalendarDays, ChartNoAxesColumnIncreasing, CircleUserRound, House, Moon, NotebookPen, Sun } from 'lucide-react'
import { createYearExperiment, db } from './data/database'
import { CheckIn } from './CheckIn'
import { Calendar } from './Calendar'
import { RestoreControl, You } from './You'
import { DEFAULT_START_DATE, experimentDay, experimentEndDate, experimentProgress, personalDateForInstant } from './domain/personal-day'
import type { DailyCheckIn, LocalProfile, YearExperiment } from './domain/types'

interface ActiveExperiment {
  experiment: YearExperiment
  profile: LocalProfile
}

type Theme = 'light' | 'dark'
type View = 'today' | 'checkin' | 'calendar' | 'trends' | 'you'

const navigation = [
  { view: 'today', label: 'Today', icon: House },
  { view: 'checkin', label: 'Check-in', icon: NotebookPen },
  { view: 'calendar', label: 'Calendar', icon: CalendarDays },
  { view: 'trends', label: 'Trends', icon: ChartNoAxesColumnIncreasing },
  { view: 'you', label: 'You', icon: CircleUserRound },
] as const

const Trends = lazy(() => import('./Trends').then((module) => ({ default: module.Trends })))

function PrimaryNavigation({ activeView, onNavigate }: { activeView: View; onNavigate: (view: View) => void }) {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {navigation.map(({ view, label, icon: Icon }) => (
        <button key={view} className={view === activeView ? 'active' : ''} aria-current={view === activeView ? 'page' : undefined} onClick={() => onNavigate(view)}>
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}

function getTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

function Setup({ onCreated }: { onCreated: (active: ActiveExperiment) => void }) {
  const [startDate, setStartDate] = useState(DEFAULT_START_DATE)
  const [isSaving, setIsSaving] = useState(false)
  const timezone = getTimezone()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    try {
      await createYearExperiment(startDate, timezone)
      const [experiment, profile] = await Promise.all([db.experiments.get('primary'), db.profiles.get('local')])
      if (experiment && profile) onCreated({ experiment, profile })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="setup-page">
      <section className="setup-copy" aria-labelledby="setup-title">
        <p className="eyebrow">365 - My Year</p>
        <h1 id="setup-title">A year to notice what helps.</h1>
        <p className="intro">This is a private experiment in recovery, energy, and a richer life. There is no streak to protect and no day that can erase another.</p>
      </section>
      <form className="setup-form" onSubmit={handleSubmit}>
        <div>
          <p className="step-label">Your starting point</p>
          <h2>When does your year begin?</h2>
          <p>You can change this until your first check-in.</p>
        </div>
        <label>
          Start date
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
        </label>
        <div className="timezone-note">
          <span>Personal days follow</span>
          <strong>{timezone.replaceAll('_', ' ')}</strong>
        </div>
        <button className="primary-button" disabled={isSaving} type="submit">
          {isSaving ? 'Starting...' : 'Begin my year'}
        </button>
        <div className="setup-restore"><span>Already have a backup?</span><RestoreControl compact /></div>
      </form>
    </main>
  )
}

function Today({ experiment, profile, theme, onToggleTheme, onOpenCheckIn, onOpenYou }: ActiveExperiment & { theme: Theme; onToggleTheme: () => void; onOpenCheckIn: () => void; onOpenYou: () => void }) {
  const today = personalDateForInstant(new Date(), profile.timezone)
  const day = experimentDay(experiment.startDate, today)
  const progress = experimentProgress(experiment.startDate, today)
  const formatter = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
  const displayDate = formatter.format(new Date(`${today}T12:00:00`))
  const checkIn = useLiveQuery(() => db.dailyCheckIns.get(`${experiment.id}:${today}`))

  return (
    <div className="app-frame">
      <header className="topbar">
        <div className="wordmark"><span>365</span> My Year</div>
        <div className="topbar-actions">
          <button className="avatar-button" aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'} onClick={onToggleTheme}>{theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}</button>
          <button className="avatar-button" aria-label="Open profile" onClick={onOpenYou}><CircleUserRound aria-hidden="true" /></button>
        </div>
      </header>
      <main className="today-page">
        <section className="today-heading">
          <div>
            <p className="eyebrow">{displayDate}</p>
            <h1 aria-label={day ? `Day ${day} of 365` : undefined}>{day ? 'Today is still becoming.' : today < experiment.startDate ? 'Your year is nearly here.' : 'Your year, complete.'}</h1>
          </div>
          {day ? <div className="day-stamp" aria-label={`Day ${day} of 365`}><span>Day</span><strong>{String(day).padStart(2, '0')}</strong><span>of 365</span></div> : <div className="progress-copy"><strong>{Math.round(progress)}%</strong><span>of your year</span></div>}
        </section>
        <div className="progress-track" aria-label={`${Math.round(progress)}% of Year Experiment complete`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
          <span style={{ width: `${progress}%` }} />
        </div>

        <section className="checkin-panel" aria-labelledby="checkin-title">
          <div>
            <p className="step-label">Today's reflection</p>
            <h2 id="checkin-title">How is today feeling?</h2>
            <p>Body, mind, and the moments that made the day yours.</p>
          </div>
          <button className="primary-button" disabled={!day} onClick={onOpenCheckIn}>{checkIn ? 'Continue check-in' : 'Start check-in'}</button>
        </section>

        <section className="signal-grid" aria-label="Today's overview">
          <article><span className="signal-index">01</span><h2>Body</h2><p>{checkIn?.sleepHours !== undefined ? `${checkIn.sleepHours} hours sleep · Energy ${checkIn.energy ?? 'not recorded'}` : 'No observations yet'}</p></article>
          <article><span className="signal-index">02</span><h2>Mind</h2><p>{checkIn?.mood !== undefined ? `Mood ${checkIn.mood}/10 · Stress ${checkIn.stress ?? 'not recorded'}/10` : 'No observations yet'}</p></article>
          <article><span className="signal-index">03</span><h2>Life</h2><p>No activities yet</p></article>
        </section>

        <section className="year-note">
          <p className="step-label">The whole experiment</p>
          <p>{experiment.startDate} to {experimentEndDate(experiment.startDate)}</p>
        </section>
      </main>
    </div>
  )
}

export function App() {
  const storedExperiment = useLiveQuery(async (): Promise<ActiveExperiment | null> => {
    const [experiment, profile] = await Promise.all([
      db.experiments.get('primary'),
      db.profiles.get('local'),
    ])
    return experiment && profile ? { experiment, profile } : null
  })
  const [createdExperiment, setCreatedExperiment] = useState<ActiveExperiment>()
  const [view, setView] = useState<View>('today')
  const [selectedDate, setSelectedDate] = useState<string>()
  const [theme, setTheme] = useState<Theme>(() => window.localStorage.getItem('365-theme') === 'dark' ? 'dark' : 'light')
  const activeExperiment = createdExperiment ?? storedExperiment

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('365-theme', theme)
  }, [theme])

  if (activeExperiment === undefined) return <div className="loading">Opening your year...</div>
  if (!activeExperiment) return <Setup onCreated={setCreatedExperiment} />

  const today = personalDateForInstant(new Date(), activeExperiment.profile.timezone)
  const navigateTo = (nextView: View) => {
    if (nextView === view) return
    setSelectedDate(undefined)
    setView(nextView)
  }

  let content
  if (view === 'calendar') {
    content = <Calendar experiment={activeExperiment.experiment} today={today} onBack={() => navigateTo('today')} onOpenDay={(date) => { setSelectedDate(date); setView('checkin') }} />
  } else if (view === 'trends') {
    content = <Suspense fallback={<div className="loading">Opening your trends...</div>}><Trends experiment={activeExperiment.experiment} today={today} onBack={() => navigateTo('today')} /></Suspense>
  } else if (view === 'you') {
    content = <You profile={activeExperiment.profile} experiment={activeExperiment.experiment} theme={theme} onThemeChange={setTheme} onBack={() => navigateTo('today')} />
  } else if (view === 'checkin') {
    const fromCalendar = selectedDate !== undefined
    content = <CheckInLoader active={activeExperiment} personalDate={selectedDate ?? today} backLabel={fromCalendar ? 'Calendar' : 'Today'} onBack={() => { setView(fromCalendar ? 'calendar' : 'today'); setSelectedDate(undefined) }} />
  } else {
    content = <Today {...activeExperiment} theme={theme} onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} onOpenCheckIn={() => navigateTo('checkin')} onOpenYou={() => navigateTo('you')} />
  }

  return <>{content}<PrimaryNavigation activeView={view} onNavigate={navigateTo} /></>
}

function CheckInLoader({ active, personalDate, backLabel, onBack }: { active: ActiveExperiment; personalDate: string; backLabel: string; onBack: () => void }) {
  const existing = useLiveQuery<DailyCheckIn | null>(() => db.dailyCheckIns.get(`${active.experiment.id}:${personalDate}`).then((value) => value ?? null))
  if (existing === undefined) return <div className="loading">Opening today's check-in...</div>
  return <CheckIn experiment={active.experiment} personalDate={personalDate} existing={existing} backLabel={backLabel} onBack={onBack} onComplete={onBack} />
}