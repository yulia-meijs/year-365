import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Activity, Brain, ChevronLeft, Footprints, HeartPulse } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { db } from './data/database'
import { alcoholTrend, numericTrend, summarizeTrend, type TrendPoint, type TrendRange } from './domain/trends'
import type { PersonalDate, YearExperiment } from './domain/types'

interface TrendsProps {
  experiment: YearExperiment
  today: PersonalDate
  onBack: () => void
}

type TrendView = 'physical' | 'mental' | 'lifestyle' | 'life'

const ranges: TrendRange[] = [7, 30, 90, 365]
const views: { value: TrendView; label: string; icon: typeof Activity }[] = [
  { value: 'physical', label: 'Physical', icon: HeartPulse },
  { value: 'mental', label: 'Mental', icon: Brain },
  { value: 'lifestyle', label: 'Lifestyle', icon: Activity },
  { value: 'life', label: 'Life', icon: Footprints },
]

function shortDate(date: PersonalDate): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${date}T12:00:00Z`))
}

function summaryText(points: TrendPoint[], unit: string): string {
  const summary = summarizeTrend(points)
  if (summary.count === 0) return 'No recorded observations in this range. Unknown days are not counted.'
  const average = Number(summary.average?.toFixed(1))
  return `${summary.count} recorded ${summary.count === 1 ? 'observation' : 'observations'}. Average ${average}${unit}; latest ${summary.latest}${unit}; range ${summary.minimum} to ${summary.maximum}${unit}. Unknown days are excluded.`
}

function TrendChart({ title, points, unit, domain = [0, 10], color = 'var(--cp-accent)', className = '' }: { title: string; points: TrendPoint[]; unit: string; domain?: [number, number]; color?: string; className?: string }) {
  const summary = summarizeTrend(points)
  const text = summaryText(points, unit)
  return (
    <article className={`trend-chart ${className}`}>
      <div className="trend-chart-heading"><div><p className="step-label">{summary.count} recorded</p><h3>{title}</h3></div>{summary.average !== undefined && <strong>{Number(summary.average.toFixed(1))}<small>{unit} avg</small></strong>}</div>
      <p className="trend-summary">{text}</p>
      {summary.count === 0 ? <div className="trend-empty">Your chart will take shape as observations are recorded.</div> : (
        <div className="chart-frame" role="img" aria-label={`${title}. ${text}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} accessibilityLayer={false}>
              <CartesianGrid vertical={false} stroke="var(--cp-border)" />
              <XAxis dataKey="date" tickFormatter={shortDate} minTickGap={32} stroke="var(--cp-text-muted)" tickLine={false} axisLine={false} />
              <YAxis domain={domain} width={34} stroke="var(--cp-text-muted)" tickLine={false} axisLine={false} />
              <Tooltip labelFormatter={(label) => shortDate(String(label))} formatter={(value) => [`${value}${unit}`, title]} contentStyle={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', borderRadius: 6 }} />
              <Line type="linear" dataKey="value" stroke={color} strokeWidth={2} connectNulls={false} isAnimationActive={false} dot={{ r: 3, fill: 'var(--cp-surface)', stroke: color, strokeWidth: 2 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </article>
  )
}

function AlcoholChart({ points }: { points: TrendPoint[] }) {
  const known = points.flatMap((point) => point.value === null ? [] : [point.value])
  const alcoholFree = known.filter((value) => value === 1).length
  const text = known.length === 0
    ? 'No alcohol observations recorded in this range. Unknown days are not counted.'
    : `${known.length} recorded alcohol ${known.length === 1 ? 'observation' : 'observations'}: ${alcoholFree} alcohol-free and ${known.length - alcoholFree} alcohol recorded. Unknown days are excluded.`
  return (
    <article className="trend-chart alcohol-trend">
      <div className="trend-chart-heading"><div><p className="step-label">{known.length} recorded</p><h3>Alcohol observations</h3></div>{known.length > 0 && <strong>{alcoholFree}<small>alcohol-free</small></strong>}</div>
      <p className="trend-summary">{text}</p>
      <div className="alcohol-strip" role="img" aria-label={text}>
        {points.map((point) => <span key={point.date} className={point.value === null ? 'unknown' : point.value === 1 ? 'free' : 'recorded'} title={`${shortDate(point.date)}: ${point.value === null ? 'Unknown' : point.value === 1 ? 'Alcohol-free' : 'Alcohol recorded'}`} />)}
      </div>
      <div className="alcohol-key" aria-hidden="true"><span><i className="free" />Alcohol-free</span><span><i className="recorded" />Alcohol recorded</span><span><i className="unknown" />Unknown</span></div>
    </article>
  )
}

export function Trends({ experiment, today, onBack }: TrendsProps) {
  const [range, setRange] = useState<TrendRange>(30)
  const [view, setView] = useState<TrendView>('physical')
  const checkIns = useLiveQuery(() => db.dailyCheckIns.where('experimentId').equals(experiment.id).toArray(), [experiment.id]) ?? []
  const trend = (metric: 'sleepHours' | 'energy' | 'mood' | 'stress' | 'sportMinutes') => numericTrend(experiment.startDate, today, range, checkIns, metric)
  const sportPoints = trend('sportMinutes')
  const sportMaximum = Math.max(60, ...sportPoints.flatMap((point) => point.value === null ? [] : [point.value]))

  return (
    <div className="trends-page">
      <header className="trends-header"><button className="icon-button" onClick={onBack} aria-label="Back to Today"><ChevronLeft aria-hidden="true" /></button><div><p className="eyebrow">Your Year Experiment</p><h1>Trends</h1></div></header>
      <main className="trends-content">
        <section className="trends-intro"><div><p className="step-label">Patterns over perfection</p><h2>Notice what changes.</h2></div><p>Only recorded observations appear here. Open days stay unknown, never zero.</p></section>
        <div className="trend-controls">
          <div className="trend-tabs" role="tablist" aria-label="Trend category">{views.map(({ value, label, icon: Icon }) => <button key={value} role="tab" aria-selected={view === value} className={view === value ? 'selected' : ''} onClick={() => setView(value)}><Icon aria-hidden="true" />{label}</button>)}</div>
          <div className="range-control" role="group" aria-label="Trend time range">{ranges.map((value) => <button key={value} aria-pressed={range === value} className={range === value ? 'selected' : ''} onClick={() => setRange(value)}>{value === 365 ? 'Year' : `${value} days`}</button>)}</div>
        </div>
        <p className="range-caption">Showing up to {range} days through {shortDate(today)}.</p>
        <section className="trend-grid" role="tabpanel">
          {view === 'physical' && <><TrendChart title="Sleep" points={trend('sleepHours')} unit="h" domain={[0, 14]} /><TrendChart title="Energy" points={trend('energy')} unit="/10" /><TrendChart title="Sport" points={sportPoints} unit=" min" domain={[0, sportMaximum]} color="var(--cp-sport)" className="sport-trend" /></>}
          {view === 'mental' && <><TrendChart title="Mood" points={trend('mood')} unit="/10" /><TrendChart title="Stress" points={trend('stress')} unit="/10" /></>}
          {view === 'lifestyle' && <AlcoholChart points={alcoholTrend(experiment.startDate, today, range, checkIns)} />}
          {view === 'life' && <div className="life-empty"><Footprints aria-hidden="true" /><p className="step-label">No activity observations yet</p><h3>Your life trends will grow here.</h3><p>Creative, social, outdoor, learning, and meaningful activity time will appear when activity tracking is available.</p></div>}
        </section>
      </main>
    </div>
  )
}