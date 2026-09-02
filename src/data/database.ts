import Dexie, { type EntityTable } from 'dexie'
import type { DailyCheckIn, Interest, LifeRule, LocalProfile, Project, ProjectMilestone, YearExperiment } from '../domain/types'

const sewingProjectId = 'project:return-to-sewing'
const sewingMilestones = ['Find sewing machine', 'Set up workspace', 'Review basic techniques', 'Choose first project', 'Choose fabric', 'Start project', 'Finish first item', 'Photograph finished item']

function returnToSewing(createdAt: string): Project {
  return {
    id: sewingProjectId,
    experimentId: 'primary',
    name: 'Return to Sewing',
    category: 'Creative',
    description: 'Reconnect with sewing and clothing design, one curious step at a time.',
    status: 'idea',
    investedMinutes: 0,
    createdAt,
    updatedAt: createdAt,
  }
}

function returnToSewingMilestones(): ProjectMilestone[] {
  return sewingMilestones.map((title, index) => ({ id: `${sewingProjectId}:${index + 1}`, projectId: sewingProjectId, title, completed: false }))
}

export class RecoveryDatabase extends Dexie {
  profiles!: EntityTable<LocalProfile, 'id'>
  experiments!: EntityTable<YearExperiment, 'id'>
  dailyCheckIns!: EntityTable<DailyCheckIn, 'id'>
  projects!: EntityTable<Project, 'id'>
  projectMilestones!: EntityTable<ProjectMilestone, 'id'>
  interests!: EntityTable<Interest, 'id'>
  lifeRules!: EntityTable<LifeRule, 'id'>

  constructor(name = 'myYear365') {
    super(name)
    this.version(1).stores({
      profiles: 'id',
      experiments: 'id, profileId, startDate',
      dailyCheckIns: 'id, experimentId, personalDate, [experimentId+personalDate]',
    })
    this.version(2).stores({
      profiles: 'id',
      experiments: 'id, profileId, startDate',
      dailyCheckIns: 'id, experimentId, personalDate, [experimentId+personalDate]',
      projects: 'id, experimentId, category, status',
      projectMilestones: 'id, projectId, completed',
      interests: 'id, experimentId, category, status',
    }).upgrade(async (transaction) => {
      const experiment = await transaction.table('experiments').get('primary')
      if (!experiment) return
      const createdAt = new Date().toISOString()
      await transaction.table('projects').put(returnToSewing(createdAt))
      await transaction.table('projectMilestones').bulkPut(returnToSewingMilestones())
    })
    this.version(3).stores({
      profiles: 'id',
      experiments: 'id, profileId, startDate',
      dailyCheckIns: 'id, experimentId, personalDate, [experimentId+personalDate]',
      projects: 'id, experimentId, category, status',
      projectMilestones: 'id, projectId, completed',
      interests: 'id, experimentId, category, status',
      lifeRules: 'id, experimentId, [experimentId+position]',
    })
  }
}

export const db = new RecoveryDatabase()

export async function createYearExperiment(startDate: string, timezone: string): Promise<void> {
  const createdAt = new Date().toISOString()
  await db.transaction('rw', db.profiles, db.experiments, db.projects, db.projectMilestones, async () => {
    await db.profiles.put({ id: 'local', timezone, createdAt })
    await db.experiments.put({ id: 'primary', profileId: 'local', startDate, createdAt })
    await db.projects.put(returnToSewing(createdAt))
    await db.projectMilestones.bulkPut(returnToSewingMilestones())
  })
}

export function dailyCheckInId(experimentId: YearExperiment['id'], personalDate: string): string {
  return `${experimentId}:${personalDate}`
}

export async function saveDailyCheckIn(checkIn: DailyCheckIn): Promise<void> {
  await db.dailyCheckIns.put(checkIn)
}