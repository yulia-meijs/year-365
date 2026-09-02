import { useEffect, useState } from 'react'
import { ArrowLeft, Check, Moon, Wine, Zap } from 'lucide-react'
import { dailyCheckInId, saveDailyCheckIn } from './data/database'
import type { DailyCheckIn, PersonalDate, YearExperiment } from './domain/types'

interface CheckInProps {
  experiment: YearExperiment
  personalDate: PersonalDate
  existing: DailyCheckIn | null
  backLabel?: string
  onBack: () => void
  onComplete: () => void
}

type CheckInDraft = Pick<DailyCheckIn, 'alcoholFree' | 'sleepHours' | 'energy' | 'mood' | 'stress' | 'reflection'>

const scaleFields = [
  { key: 'energy', label: 'Energy', low: 'Drained', high: 'Full of energy' },
  { key: 'mood', label: 'Mood', low: 'Very low', high: 'Very good' },
  { key: 'stress', label: 'Stress', low: 'Calm', high: 'Overwhelmed' },
] as const

function toDraft(checkIn: DailyCheckIn | null): CheckInDraft {
  return {
    alcoholFree: checkIn?.alcoholFree,
    sleepHours: checkIn?.sleepHours,
    energy: checkIn?.energy,
    mood: checkIn?.mood,
    stress: checkIn?.stress,
    reflection: checkIn?.reflection ?? '',
  }
}

export function CheckIn({ experiment, personalDate, existing, backLabel = 'Today', onBack, onComplete }: CheckInProps) {
  const [draft, setDraft] = useState<CheckInDraft>(() => toDraft(existing))
  const [hasChanged, setHasChanged] = useState(false)
  const [saveState, setSaveState] = useState<'saved' | 'saving'>('saved')

  const isComplete = draft.alcoholFree !== undefined
    && draft.sleepHours !== undefined
    && draft.energy !== undefined
    && draft.mood !== undefined
    && draft.stress !== undefined

  async function persist(status: DailyCheckIn['status']) {
    setSaveState('saving')
    await saveDailyCheckIn({
      id: dailyCheckInId(experiment.id, personalDate),
      experimentId: experiment.id,
      personalDate,
      status,
      ...draft,
      reflection: draft.reflection?.trim() || undefined,
      updatedAt: new Date().toISOString(),
    })
    setSaveState('saved')
  }

  useEffect(() => {
    if (!hasChanged) return
    const timer = window.setTimeout(() => {
      void saveDailyCheckIn({
        id: dailyCheckInId(experiment.id, personalDate),
        experimentId: experiment.id,
        personalDate,
        status: 'draft',
        ...draft,
        reflection: draft.reflection?.trim() || undefined,
        updatedAt: new Date().toISOString(),
      }).then(() => setSaveState('saved'))
    }, 350)
    return () => window.clearTimeout(timer)
  }, [draft, experiment.id, hasChanged, personalDate])

  function update<K extends keyof CheckInDraft>(key: K, value: CheckInDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
    setHasChanged(true)
    setSaveState('saving')
  }

  async function handleComplete() {
    if (!isComplete) return
    await persist('complete')
    onComplete()
  }

  return (
    <div className="checkin-page">
      <header className="checkin-header">
        <button className="icon-button" onClick={onBack} aria-label={`Back to ${backLabel}`}><ArrowLeft aria-hidden="true" /></button>
        <div>
          <p className="eyebrow">Daily check-in · {personalDate}</p>
          <h1>How was today?</h1>
        </div>
        <p className="save-state" aria-live="polite">{saveState === 'saving' ? 'Saving...' : 'Saved locally'}</p>
      </header>

      <main className="checkin-form">
        <section className="form-section" aria-labelledby="alcohol-heading">
          <div className="section-heading"><Wine aria-hidden="true" /><div><p className="step-label">Lifestyle</p><h2 id="alcohol-heading">Alcohol-free today?</h2></div></div>
          <div className="segmented-control" role="group" aria-label="Alcohol-free today">
            <button className={draft.alcoholFree === true ? 'selected' : ''} onClick={() => update('alcoholFree', true)} type="button">Yes</button>
            <button className={draft.alcoholFree === false ? 'selected' : ''} onClick={() => update('alcoholFree', false)} type="button">Alcohol recorded</button>
          </div>
        </section>

        <section className="form-section" aria-labelledby="sleep-heading">
          <div className="section-heading"><Moon aria-hidden="true" /><div><p className="step-label">Body</p><h2 id="sleep-heading">How long did you sleep?</h2></div></div>
          <label className="number-field">
            <span>Hours of sleep</span>
            <span><input type="number" inputMode="decimal" min="0" max="24" step="0.25" value={draft.sleepHours ?? ''} onChange={(event) => update('sleepHours', event.target.value === '' ? undefined : Number(event.target.value))} /> hours</span>
          </label>
        </section>

        <section className="form-section scales-section" aria-labelledby="feelings-heading">
          <div className="section-heading"><Zap aria-hidden="true" /><div><p className="step-label">Body and mind</p><h2 id="feelings-heading">What did today feel like?</h2></div></div>
          {scaleFields.map(({ key, label, low, high }) => (
            <fieldset className="scale-field" key={key}>
              <legend>{label}</legend>
              <div className="scale-options">
                {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                  <button type="button" key={value} className={draft[key] === value ? 'selected' : ''} onClick={() => update(key, value)} aria-label={`${label} ${value} out of 10`}>{value}</button>
                ))}
              </div>
              <div className="scale-labels"><span>{low}</span><span>{high}</span></div>
            </fieldset>
          ))}
        </section>

        <section className="form-section" aria-labelledby="reflection-heading">
          <div className="section-heading"><Check aria-hidden="true" /><div><p className="step-label">Optional reflection</p><h2 id="reflection-heading">Anything you want to remember?</h2></div></div>
          <label className="reflection-field">
            <span className="sr-only">How was today?</span>
            <textarea value={draft.reflection ?? ''} onChange={(event) => update('reflection', event.target.value)} maxLength={2000} placeholder="A moment, a feeling, something that helped..." />
          </label>
        </section>

        <div className="complete-bar">
          <p>{isComplete ? 'Everything needed is here.' : 'Answer the five core questions to complete today.'}</p>
          <button className="primary-button" type="button" disabled={!isComplete || saveState === 'saving'} onClick={() => void handleComplete()}><Check aria-hidden="true" />Complete check-in</button>
        </div>
      </main>
    </div>
  )
}