import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArchiveRestore, ChevronLeft, Database, Download, FileSpreadsheet, HardDrive, Moon, ShieldCheck, Trash2, Upload } from 'lucide-react'
import { backupCsv, createBackup, deleteAllData, parseBackup, restoreBackup, type CsvRecordType, type RecoveryBackup } from './data/backup'
import { db } from './data/database'
import type { LocalProfile, YearExperiment } from './domain/types'

interface YouProps {
  profile: LocalProfile
  experiment: YearExperiment
  theme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
  onBack: () => void
}

function downloadText(content: string, filename: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function backupDate(): string {
  return new Date().toISOString().slice(0, 10)
}

async function downloadJsonBackup(): Promise<void> {
  const backup = await createBackup()
  downloadText(JSON.stringify(backup, null, 2), `365-my-year-backup-${backupDate()}.json`, 'application/json')
}

export function RestoreControl({ compact = false }: { compact?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<RecoveryBackup>()
  const [error, setError] = useState<string>()
  const [isRestoring, setIsRestoring] = useState(false)

  async function chooseFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setError(undefined)
    setPending(undefined)
    try {
      setPending(parseBackup(await file.text()))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'This backup could not be read.')
    } finally {
      event.target.value = ''
    }
  }

  async function confirmRestore() {
    if (!pending) return
    setIsRestoring(true)
    try {
      await restoreBackup(pending)
      window.location.reload()
    } catch {
      setError('The backup could not be restored. Your current data was not changed.')
      setIsRestoring(false)
    }
  }

  return (
    <div className={`restore-control ${compact ? 'compact' : ''}`}>
      <input ref={inputRef} className="sr-only" type="file" accept="application/json,.json" onChange={chooseFile} aria-label="Choose JSON backup" />
      <button type="button" className="secondary-button" onClick={() => inputRef.current?.click()}><Upload aria-hidden="true" />Choose JSON backup</button>
      {error && <p className="form-message error" role="alert">{error}</p>}
      {pending && (
        <div className="restore-confirm" role="status">
          <ArchiveRestore aria-hidden="true" />
          <div><strong>Backup ready to restore</strong><p>{pending.data.dailyCheckIns.length} check-ins · {pending.data.projects.length} projects · {pending.data.lifeRules.length} life rules · exported {pending.exportedAt.slice(0, 10)}</p></div>
          <button type="button" className="primary-button" disabled={isRestoring} onClick={confirmRestore}>{isRestoring ? 'Restoring...' : 'Replace local data'}</button>
        </div>
      )}
    </div>
  )
}

export function You({ profile, experiment, theme, onThemeChange, onBack }: YouProps) {
  const [csvType, setCsvType] = useState<CsvRecordType>('daily-check-ins')
  const [showDelete, setShowDelete] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const checkInCount = useLiveQuery(() => db.dailyCheckIns.where('experimentId').equals(experiment.id).count(), [experiment.id]) ?? 0

  async function downloadCsv() {
    const backup = await createBackup()
    downloadText(backupCsv(backup, csvType), `365-my-year-${csvType}-${backupDate()}.csv`, 'text/csv;charset=utf-8')
  }

  async function confirmDelete() {
    if (confirmation !== 'DELETE MY DATA') return
    setIsDeleting(true)
    await deleteAllData()
    window.location.reload()
  }

  return (
    <div className="you-page">
      <header className="you-header"><button className="icon-button" onClick={onBack} aria-label="Back to Today"><ChevronLeft aria-hidden="true" /></button><div><p className="eyebrow">Local Profile</p><h1>You</h1></div></header>
      <main className="you-content">
        <section className="you-intro"><div><p className="step-label">Private by design</p><h2>Your year belongs to you.</h2></div><p>Everything is stored in this browser. No account, analytics, cloud sync, or data sharing.</p></section>

        <section className="profile-band" aria-labelledby="profile-title">
          <div className="section-icon"><ShieldCheck aria-hidden="true" /></div>
          <div><p className="step-label">Local Profile</p><h2 id="profile-title">This device, this year</h2><p>Personal Days follow your configured timezone. Existing records keep their original calendar dates.</p></div>
          <dl><div><dt>Timezone</dt><dd>{profile.timezone.replaceAll('_', ' ')}</dd></div><div><dt>Year Experiment</dt><dd>{experiment.startDate} onward</dd></div><div><dt>Daily Check-Ins</dt><dd>{checkInCount}</dd></div></dl>
        </section>

        <section className="appearance-band" aria-labelledby="appearance-title">
          <Moon className="section-icon" aria-hidden="true" />
          <div><p className="step-label">Appearance</p><h2 id="appearance-title">Read the year your way</h2><p>Dark theme is optional and stays selected on this browser.</p></div>
          <label className="theme-switch"><span>Use dark theme</span><input type="checkbox" checked={theme === 'dark'} onChange={(event) => onThemeChange(event.target.checked ? 'dark' : 'light')} /><span aria-hidden="true" /></label>
        </section>

        <div className="you-grid">
          <section className="data-panel" aria-labelledby="backup-title">
            <div className="panel-heading"><Database aria-hidden="true" /><div><p className="step-label">Lossless copy</p><h2 id="backup-title">Back up your year</h2></div></div>
            <p>A JSON backup contains every supported record, including drafts and unknown observations. Keep it somewhere private.</p>
            <button type="button" className="primary-button button-with-icon" onClick={downloadJsonBackup}><Download aria-hidden="true" />Download JSON backup</button>
          </section>

          <section className="data-panel" aria-labelledby="csv-title">
            <div className="panel-heading"><FileSpreadsheet aria-hidden="true" /><div><p className="step-label">For analysis</p><h2 id="csv-title">Export a CSV</h2></div></div>
            <p>CSV files are convenient for spreadsheets. They are not backups and cannot be restored.</p>
            <label className="select-field">Record type<select value={csvType} onChange={(event) => setCsvType(event.target.value as CsvRecordType)}><option value="daily-check-ins">Daily Check-Ins</option><option value="projects">Projects</option><option value="project-milestones">Project Milestones</option><option value="interests">Things to Try</option><option value="life-rules">Life Rules</option><option value="year-experiments">Year Experiment</option><option value="local-profiles">Local Profile</option></select></label>
            <button type="button" className="secondary-button button-with-icon" onClick={downloadCsv}><Download aria-hidden="true" />Download CSV</button>
          </section>
        </div>

        <section className="restore-panel" aria-labelledby="restore-title">
          <div className="panel-heading"><HardDrive aria-hidden="true" /><div><p className="step-label">Validated replacement</p><h2 id="restore-title">Restore a backup</h2></div></div>
          <p>Choose a JSON backup to inspect it first. Nothing changes until you confirm replacement.</p>
          <RestoreControl />
        </section>

        <section className="danger-zone" aria-labelledby="delete-title">
          <div><p className="step-label">Permanent action</p><h2 id="delete-title">Delete all local data</h2><p>This removes your Local Profile, Year Experiment, Daily Check-Ins, projects, ideas, life rules, and app caches from this browser.</p></div>
          {!showDelete && <button type="button" className="danger-button" onClick={() => setShowDelete(true)}><Trash2 aria-hidden="true" />Review deletion</button>}
          {showDelete && <div className="delete-confirm"><p><strong>Download a backup first.</strong> Deletion cannot be undone.</p><button type="button" className="secondary-button button-with-icon" onClick={downloadJsonBackup}><Download aria-hidden="true" />Download backup</button><label>Type <strong>DELETE MY DATA</strong> to confirm<input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" /></label><div className="delete-actions"><button type="button" className="secondary-button" onClick={() => { setShowDelete(false); setConfirmation('') }}>Cancel</button><button type="button" className="danger-button" disabled={confirmation !== 'DELETE MY DATA' || isDeleting} onClick={confirmDelete}>{isDeleting ? 'Deleting...' : 'Delete everything'}</button></div></div>}
        </section>
      </main>
    </div>
  )
}