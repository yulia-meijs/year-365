import { db, type RecoveryDatabase } from './database'
import { projectCategories, type DailyCheckIn, type Interest, type LifeRule, type LocalProfile, type Project, type ProjectMilestone, type YearExperiment } from '../domain/types'

export const BACKUP_FORMAT = '365-my-year'
export const BACKUP_VERSION = 3

export interface BackupData {
  profiles: LocalProfile[]
  experiments: YearExperiment[]
  dailyCheckIns: DailyCheckIn[]
  projects: Project[]
  projectMilestones: ProjectMilestone[]
  interests: Interest[]
  lifeRules: LifeRule[]
}

export interface RecoveryBackup {
  format: typeof BACKUP_FORMAT
  version: typeof BACKUP_VERSION
  exportedAt: string
  data: BackupData
}

export type CsvRecordType = 'daily-check-ins' | 'projects' | 'project-milestones' | 'interests' | 'life-rules' | 'year-experiments' | 'local-profiles'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isOptionalNumber(value: unknown): boolean {
  return value === undefined || typeof value === 'number'
}

function isOptionalBoolean(value: unknown): boolean {
  return value === undefined || typeof value === 'boolean'
}

function isProfile(value: unknown): value is LocalProfile {
  return isRecord(value) && value.id === 'local' && isString(value.timezone) && isString(value.createdAt)
}

function isExperiment(value: unknown): value is YearExperiment {
  return isRecord(value) && value.id === 'primary' && value.profileId === 'local' && isString(value.startDate) && isString(value.createdAt)
}

function isCheckIn(value: unknown): value is DailyCheckIn {
  return isRecord(value)
    && isString(value.id)
    && value.experimentId === 'primary'
    && isString(value.personalDate)
    && (value.status === 'draft' || value.status === 'complete')
    && isOptionalBoolean(value.alcoholFree)
    && isOptionalNumber(value.sleepHours)
    && isOptionalNumber(value.energy)
    && isOptionalNumber(value.mood)
    && isOptionalNumber(value.stress)
    && (value.sport === undefined || isString(value.sport))
    && isOptionalNumber(value.sportMinutes)
    && (value.reflection === undefined || isString(value.reflection))
    && isString(value.updatedAt)
}

function isProject(value: unknown): value is Project {
  return isRecord(value) && isString(value.id) && value.experimentId === 'primary' && isString(value.name)
    && projectCategories.includes(value.category as Project['category'])
    && ['idea', 'active', 'paused', 'complete'].includes(String(value.status))
    && (value.description === undefined || isString(value.description))
    && (value.startDate === undefined || isString(value.startDate))
    && (value.targetDate === undefined || isString(value.targetDate))
    && (value.notes === undefined || isString(value.notes))
    && typeof value.investedMinutes === 'number' && isString(value.createdAt) && isString(value.updatedAt)
}

function isMilestone(value: unknown): value is ProjectMilestone {
  return isRecord(value) && isString(value.id) && isString(value.projectId) && isString(value.title)
    && typeof value.completed === 'boolean' && (value.completedAt === undefined || isString(value.completedAt))
}

function isInterest(value: unknown): value is Interest {
  return isRecord(value) && isString(value.id) && value.experimentId === 'primary' && isString(value.name)
    && projectCategories.includes(value.category as Interest['category'])
    && ['idea', 'interested', 'tried', 'loved', 'not-for-me'].includes(String(value.status))
    && isString(value.createdAt) && isString(value.updatedAt)
}

function isLifeRule(value: unknown): value is LifeRule {
  return isRecord(value) && isString(value.id) && value.experimentId === 'primary'
    && isString(value.sentence) && value.sentence.trim().length > 0 && value.sentence.length <= 280
    && typeof value.position === 'number' && Number.isInteger(value.position) && value.position > 0
    && isString(value.createdAt) && isString(value.updatedAt)
}

export function parseBackup(text: string): RecoveryBackup {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new Error('This file is not valid JSON.')
  }

  if (!isRecord(value) || value.format !== BACKUP_FORMAT || typeof value.version !== 'number') {
    throw new Error('This is not a 365 - My Year backup.')
  }
  if (value.version > BACKUP_VERSION) {
    throw new Error('This backup was created by a newer version of the app.')
  }
  if (![1, 2, BACKUP_VERSION].includes(value.version) || !isString(value.exportedAt) || !isRecord(value.data)) {
    throw new Error('This backup version is not supported.')
  }

  const { profiles, experiments, dailyCheckIns } = value.data
  if (!Array.isArray(profiles) || !profiles.every(isProfile)
    || !Array.isArray(experiments) || !experiments.every(isExperiment)
    || !Array.isArray(dailyCheckIns) || !dailyCheckIns.every(isCheckIn)) {
    throw new Error('The backup contains invalid or incomplete records.')
  }
  if (profiles.length !== 1 || experiments.length !== 1
    || dailyCheckIns.some((checkIn) => checkIn.id !== `${checkIn.experimentId}:${checkIn.personalDate}`)) {
    throw new Error('The backup contains invalid or incomplete records.')
  }

  if (value.version === 1) {
    return { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: value.exportedAt, data: { profiles, experiments, dailyCheckIns, projects: [], projectMilestones: [], interests: [], lifeRules: [] } }
  }

  const { projects, projectMilestones, interests } = value.data
  if (!Array.isArray(projects) || !projects.every(isProject)
    || !Array.isArray(projectMilestones) || !projectMilestones.every(isMilestone)
    || !Array.isArray(interests) || !interests.every(isInterest)
    || projectMilestones.some((milestone) => !projects.some((project) => project.id === milestone.projectId))) {
    throw new Error('The backup contains invalid or incomplete records.')
  }

  if (value.version === 2) {
    return { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: value.exportedAt, data: { profiles, experiments, dailyCheckIns, projects, projectMilestones, interests, lifeRules: [] } }
  }

  const { lifeRules } = value.data
  if (!Array.isArray(lifeRules) || !lifeRules.every(isLifeRule) || lifeRules.length > 10) {
    throw new Error('The backup contains invalid or incomplete records.')
  }

  return value as unknown as RecoveryBackup
}

export async function createBackup(database: RecoveryDatabase = db): Promise<RecoveryBackup> {
  const [profiles, experiments, dailyCheckIns, projects, projectMilestones, interests, lifeRules] = await database.transaction(
    'r',
    [database.profiles, database.experiments, database.dailyCheckIns, database.projects, database.projectMilestones, database.interests, database.lifeRules],
    () => Promise.all([
      database.profiles.toArray(),
      database.experiments.toArray(),
      database.dailyCheckIns.toArray(),
      database.projects.toArray(),
      database.projectMilestones.toArray(),
      database.interests.toArray(),
      database.lifeRules.toArray(),
    ] as const),
  )
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data: { profiles, experiments, dailyCheckIns, projects, projectMilestones, interests, lifeRules } }
}

export async function restoreBackup(backup: RecoveryBackup, database: RecoveryDatabase = db): Promise<void> {
  await database.transaction('rw', [database.profiles, database.experiments, database.dailyCheckIns, database.projects, database.projectMilestones, database.interests, database.lifeRules], async () => {
    await Promise.all([database.profiles.clear(), database.experiments.clear(), database.dailyCheckIns.clear(), database.projects.clear(), database.projectMilestones.clear(), database.interests.clear(), database.lifeRules.clear()])
    await database.profiles.bulkPut(backup.data.profiles)
    await database.experiments.bulkPut(backup.data.experiments)
    await database.dailyCheckIns.bulkPut(backup.data.dailyCheckIns)
    await database.projects.bulkPut(backup.data.projects)
    await database.projectMilestones.bulkPut(backup.data.projectMilestones)
    await database.interests.bulkPut(backup.data.interests)
    await database.lifeRules.bulkPut(backup.data.lifeRules)
  })
}

export async function deleteAllData(database: RecoveryDatabase = db): Promise<void> {
  await database.transaction('rw', [database.profiles, database.experiments, database.dailyCheckIns, database.projects, database.projectMilestones, database.interests, database.lifeRules], () => Promise.all([
    database.profiles.clear(),
    database.experiments.clear(),
    database.dailyCheckIns.clear(),
    database.projects.clear(),
    database.projectMilestones.clear(),
    database.interests.clear(),
    database.lifeRules.clear(),
  ]).then(() => undefined))
  if ('caches' in globalThis) {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map((name) => caches.delete(name)))
  }
}

function csvCell(value: unknown): string {
  if (value === undefined || value === null) return ''
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function csvRows(headers: string[], records: object[]): string {
  return [headers.join(','), ...records.map((record) => headers.map((header) => csvCell(Reflect.get(record, header))).join(','))].join('\r\n')
}

export function backupCsv(backup: RecoveryBackup, recordType: CsvRecordType): string {
  if (recordType === 'daily-check-ins') {
    return csvRows(['id', 'experimentId', 'personalDate', 'status', 'alcoholFree', 'sleepHours', 'energy', 'mood', 'stress', 'sport', 'sportMinutes', 'reflection', 'updatedAt'], backup.data.dailyCheckIns)
  }
  if (recordType === 'projects') {
    return csvRows(['id', 'experimentId', 'name', 'category', 'description', 'startDate', 'targetDate', 'status', 'notes', 'investedMinutes', 'createdAt', 'updatedAt'], backup.data.projects)
  }
  if (recordType === 'project-milestones') {
    return csvRows(['id', 'projectId', 'title', 'completed', 'completedAt'], backup.data.projectMilestones)
  }
  if (recordType === 'interests') {
    return csvRows(['id', 'experimentId', 'name', 'category', 'status', 'createdAt', 'updatedAt'], backup.data.interests)
  }
  if (recordType === 'life-rules') {
    return csvRows(['id', 'experimentId', 'sentence', 'position', 'createdAt', 'updatedAt'], backup.data.lifeRules)
  }
  if (recordType === 'year-experiments') {
    return csvRows(['id', 'profileId', 'startDate', 'createdAt'], backup.data.experiments)
  }
  return csvRows(['id', 'timezone', 'createdAt'], backup.data.profiles)
}