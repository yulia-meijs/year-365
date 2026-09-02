import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { BookOpenText, Check, ChevronLeft, CirclePlus, Clock3, Lightbulb, Palette, Plus, Save, Trash2 } from 'lucide-react'
import { db } from './data/database'
import { projectCategories, type InterestStatus, type Project, type ProjectCategory, type ProjectStatus, type YearExperiment } from './domain/types'

interface ProjectsProps {
  experiment: YearExperiment
  onBack: () => void
}

type WorkspaceView = 'projects' | 'interests' | 'rules'

const projectStatuses: { value: ProjectStatus; label: string }[] = [
  { value: 'idea', label: 'Exploring' },
  { value: 'active', label: 'In progress' },
  { value: 'paused', label: 'Resting' },
  { value: 'complete', label: 'Finished' },
]

const interestStatuses: { value: InterestStatus; label: string }[] = [
  { value: 'idea', label: 'Idea' },
  { value: 'interested', label: 'Interested' },
  { value: 'tried', label: 'Tried' },
  { value: 'loved', label: 'Loved' },
  { value: 'not-for-me', label: 'Not for me' },
]

function newId(prefix: string): string {
  return `${prefix}:${crypto.randomUUID()}`
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`
}

export function Projects({ experiment, onBack }: ProjectsProps) {
  const [view, setView] = useState<WorkspaceView>('projects')
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectCategory, setProjectCategory] = useState<ProjectCategory>('Creative')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [notes, setNotes] = useState('')
  const [interestName, setInterestName] = useState('')
  const [interestCategory, setInterestCategory] = useState<ProjectCategory>('Creative')
  const [milestoneDrafts, setMilestoneDrafts] = useState<Record<string, string>>({})
  const [timeDrafts, setTimeDrafts] = useState<Record<string, string>>({})
  const [ruleSentence, setRuleSentence] = useState('')
  const [ruleDrafts, setRuleDrafts] = useState<Record<string, string>>({})

  const projects = useLiveQuery(() => db.projects.where('experimentId').equals(experiment.id).sortBy('createdAt'), [experiment.id]) ?? []
  const milestones = useLiveQuery(() => db.projectMilestones.toArray()) ?? []
  const interests = useLiveQuery(() => db.interests.where('experimentId').equals(experiment.id).sortBy('createdAt'), [experiment.id]) ?? []
  const lifeRules = useLiveQuery(async () => {
    const rules = await db.lifeRules.where('experimentId').equals(experiment.id).toArray()
    return rules.sort((left, right) => left.position - right.position)
  }, [experiment.id]) ?? []

  async function createProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = projectName.trim()
    if (!name) return
    const now = new Date().toISOString()
    await db.projects.add({
      id: newId('project'), experimentId: experiment.id, name, category: projectCategory,
      description: description.trim() || undefined, startDate: startDate || undefined,
      targetDate: targetDate || undefined, status: 'idea', notes: notes.trim() || undefined,
      investedMinutes: 0, createdAt: now, updatedAt: now,
    })
    setProjectName('')
    setDescription('')
    setStartDate('')
    setTargetDate('')
    setNotes('')
    setShowProjectForm(false)
  }

  async function updateProject(project: Project, updates: Partial<Project>) {
    await db.projects.update(project.id, { ...updates, updatedAt: new Date().toISOString() })
  }

  async function deleteProject(project: Project) {
    await db.transaction('rw', db.projects, db.projectMilestones, async () => {
      await db.projectMilestones.where('projectId').equals(project.id).delete()
      await db.projects.delete(project.id)
    })
  }

  async function addMilestone(projectId: string) {
    const title = milestoneDrafts[projectId]?.trim()
    if (!title) return
    await db.projectMilestones.add({ id: newId('milestone'), projectId, title, completed: false })
    setMilestoneDrafts((current) => ({ ...current, [projectId]: '' }))
  }

  async function addTime(project: Project) {
    const minutes = Number(timeDrafts[project.id])
    if (!Number.isFinite(minutes) || minutes <= 0) return
    await updateProject(project, { investedMinutes: project.investedMinutes + Math.round(minutes) })
    setTimeDrafts((current) => ({ ...current, [project.id]: '' }))
  }

  async function addInterest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = interestName.trim()
    if (!name) return
    const now = new Date().toISOString()
    await db.interests.add({ id: newId('interest'), experimentId: experiment.id, name, category: interestCategory, status: 'idea', createdAt: now, updatedAt: now })
    setInterestName('')
  }

  async function addLifeRule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const sentence = ruleSentence.trim()
    if (!sentence || lifeRules.length >= 10) return
    const now = new Date().toISOString()
    const position = lifeRules.reduce((highest, rule) => Math.max(highest, rule.position), 0) + 1
    await db.lifeRules.add({ id: newId('life-rule'), experimentId: experiment.id, sentence, position, createdAt: now, updatedAt: now })
    setRuleSentence('')
  }

  async function saveLifeRule(id: string, original: string) {
    const sentence = (ruleDrafts[id] ?? original).trim()
    if (!sentence) return
    await db.lifeRules.update(id, { sentence, updatedAt: new Date().toISOString() })
    setRuleDrafts((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
  }

  return (
    <div className="projects-page">
      <header className="projects-header"><button className="icon-button" onClick={onBack} aria-label="Back to Today"><ChevronLeft aria-hidden="true" /></button><div><p className="eyebrow">Creativity and curiosity</p><h1>Projects</h1></div></header>
      <main className="projects-content">
        <section className="projects-intro"><div><p className="step-label">Something to explore</p><h2>Make room for what lights you up.</h2></div><p>Keep a thread of ideas, creative work, and personal projects. Time here is noticed, not judged.</p></section>

        <div className="workspace-tabs" role="tablist" aria-label="Projects workspace">
          <button role="tab" aria-selected={view === 'projects'} className={view === 'projects' ? 'selected' : ''} onClick={() => setView('projects')}><Palette aria-hidden="true" />Projects</button>
          <button role="tab" aria-selected={view === 'interests'} className={view === 'interests' ? 'selected' : ''} onClick={() => setView('interests')}><Lightbulb aria-hidden="true" />Things to try</button>
          <button role="tab" aria-selected={view === 'rules'} className={view === 'rules' ? 'selected' : ''} onClick={() => setView('rules')}><BookOpenText aria-hidden="true" />Life rules</button>
        </div>

        {view === 'projects' && <section role="tabpanel" className="projects-workspace">
          <div className="workspace-heading"><div><p className="step-label">Longer journeys</p><h2>Your projects</h2></div><button type="button" className="primary-button button-with-icon" onClick={() => setShowProjectForm((current) => !current)}><Plus aria-hidden="true" />New project</button></div>
          {showProjectForm && <form className="project-form" onSubmit={createProject}>
            <label>Project name<input value={projectName} onChange={(event) => setProjectName(event.target.value)} required maxLength={100} placeholder="Make a dress" /></label>
            <label>Category<select value={projectCategory} onChange={(event) => setProjectCategory(event.target.value as ProjectCategory)}>{projectCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
            <label className="wide-field">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={1000} placeholder="What would you like to explore?" /></label>
            <label>Start date <span>optional</span><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
            <label>Target date <span>optional</span><input type="date" min={startDate || undefined} value={targetDate} onChange={(event) => setTargetDate(event.target.value)} /></label>
            <label className="wide-field">Notes <span>optional</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} /></label>
            <div className="project-form-actions"><button type="button" className="secondary-button" onClick={() => setShowProjectForm(false)}>Cancel</button><button type="submit" className="primary-button">Create project</button></div>
          </form>}

          <div className="project-list">
            {projects.length === 0 && <div className="project-empty"><Palette aria-hidden="true" /><h3>No projects yet</h3><p>Start with something you want to explore. A deadline is never required.</p></div>}
            {projects.map((project) => {
              const projectMilestones = milestones.filter((milestone) => milestone.projectId === project.id)
              const completed = projectMilestones.filter((milestone) => milestone.completed).length
              return <article className="project-card" key={project.id}>
                <div className="project-card-heading"><div><p className="step-label">{project.category}</p><h3>{project.name}</h3></div><button type="button" className="quiet-icon-button" aria-label={`Delete ${project.name}`} onClick={() => void deleteProject(project)}><Trash2 aria-hidden="true" /></button></div>
                {project.description && <p className="project-description">{project.description}</p>}
                <div className="project-meta">
                  <label>Status<select aria-label={`${project.name} status`} value={project.status} onChange={(event) => void updateProject(project, { status: event.target.value as ProjectStatus })}>{projectStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
                  <div><span>Time noticed</span><strong><Clock3 aria-hidden="true" />{formatMinutes(project.investedMinutes)}</strong></div>
                  {(project.startDate || project.targetDate) && <div><span>Dates</span><strong>{project.startDate ?? 'Open'}{project.targetDate ? ` to ${project.targetDate}` : ' onward'}</strong></div>}
                </div>
                {project.notes && <p className="project-notes">{project.notes}</p>}
                <div className="time-entry"><label>Add time<input aria-label={`Minutes for ${project.name}`} type="number" inputMode="numeric" min="1" step="1" value={timeDrafts[project.id] ?? ''} onChange={(event) => setTimeDrafts((current) => ({ ...current, [project.id]: event.target.value }))} placeholder="30" /></label><span>minutes</span><button className="secondary-button" type="button" onClick={() => void addTime(project)}>Add</button></div>
                <div className="milestones"><div className="milestones-heading"><h4>Milestones</h4><span>{completed} of {projectMilestones.length}</span></div>
                  {projectMilestones.map((milestone) => <label className="milestone" key={milestone.id}><input type="checkbox" checked={milestone.completed} onChange={(event) => void db.projectMilestones.update(milestone.id, { completed: event.target.checked, completedAt: event.target.checked ? new Date().toISOString() : undefined })} /><span><Check aria-hidden="true" />{milestone.title}</span></label>)}
                  <div className="milestone-entry"><input aria-label={`New milestone for ${project.name}`} value={milestoneDrafts[project.id] ?? ''} onChange={(event) => setMilestoneDrafts((current) => ({ ...current, [project.id]: event.target.value }))} maxLength={140} placeholder="A small next step" /><button type="button" className="quiet-icon-button" aria-label={`Add milestone to ${project.name}`} onClick={() => void addMilestone(project.id)}><CirclePlus aria-hidden="true" /></button></div>
                </div>
              </article>
            })}
          </div>
        </section>}

        {view === 'interests' && <section role="tabpanel" className="interests-workspace">
          <div className="workspace-heading"><div><p className="step-label">No obligation</p><h2>Things I want to try</h2></div><p>These are curiosity states, not tasks to finish.</p></div>
          <form className="interest-form" onSubmit={addInterest}><label><span className="sr-only">Something to try</span><input value={interestName} onChange={(event) => setInterestName(event.target.value)} required maxLength={100} placeholder="Pottery, photography, dancing..." /></label><label><span className="sr-only">Interest category</span><select aria-label="Interest category" value={interestCategory} onChange={(event) => setInterestCategory(event.target.value as ProjectCategory)}>{projectCategories.map((category) => <option key={category}>{category}</option>)}</select></label><button type="submit" className="primary-button button-with-icon"><Plus aria-hidden="true" />Add idea</button></form>
          <div className="interest-list">{interests.length === 0 && <div className="project-empty"><Lightbulb aria-hidden="true" /><h3>Your idea bank is open</h3><p>Add anything that sparks a little curiosity.</p></div>}{interests.map((interest) => <article key={interest.id} className="interest-row"><div><p className="step-label">{interest.category}</p><h3>{interest.name}</h3></div><select aria-label={`${interest.name} exploration state`} value={interest.status} onChange={(event) => void db.interests.update(interest.id, { status: event.target.value as InterestStatus, updatedAt: new Date().toISOString() })}>{interestStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select><button type="button" className="quiet-icon-button" aria-label={`Remove ${interest.name}`} onClick={() => void db.interests.delete(interest.id)}><Trash2 aria-hidden="true" /></button></article>)}</div>
        </section>}

        {view === 'rules' && <section role="tabpanel" className="rules-workspace">
          <div className="workspace-heading"><div><p className="step-label">Your own compass</p><h2>Life rules</h2></div><p>{lifeRules.length} of 10 sentences</p></div>
          <form className="rule-form" onSubmit={addLifeRule}>
            <label><span className="sr-only">New life rule</span><textarea value={ruleSentence} onChange={(event) => setRuleSentence(event.target.value)} disabled={lifeRules.length >= 10} required maxLength={280} placeholder={lifeRules.length >= 10 ? 'Your chapter has ten rules.' : 'Write one sentence you want to live by...'} /></label>
            <div><span>{ruleSentence.length}/280</span><button type="submit" className="primary-button button-with-icon" disabled={lifeRules.length >= 10 || !ruleSentence.trim()}><Plus aria-hidden="true" />Add rule</button></div>
          </form>
          <ol className="rule-list">
            {lifeRules.length === 0 && <li className="project-empty"><BookOpenText aria-hidden="true" /><h3>A blank chapter</h3><p>Add a sentence that feels useful, true, or worth remembering.</p></li>}
            {lifeRules.map((rule, index) => {
              const draft = ruleDrafts[rule.id] ?? rule.sentence
              return <li className="rule-row" key={rule.id}>
                <span className="rule-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <label><span className="sr-only">Life rule {index + 1}</span><textarea aria-label={`Life rule ${index + 1}`} value={draft} maxLength={280} onChange={(event) => setRuleDrafts((current) => ({ ...current, [rule.id]: event.target.value }))} /></label>
                <div className="rule-actions"><button type="button" className="quiet-icon-button" aria-label={`Save life rule ${index + 1}`} disabled={!draft.trim() || draft.trim() === rule.sentence} onClick={() => void saveLifeRule(rule.id, rule.sentence)}><Save aria-hidden="true" /></button><button type="button" className="quiet-icon-button" aria-label={`Remove life rule ${index + 1}`} onClick={() => void db.lifeRules.delete(rule.id)}><Trash2 aria-hidden="true" /></button></div>
              </li>
            })}
          </ol>
        </section>}
      </main>
    </div>
  )
}