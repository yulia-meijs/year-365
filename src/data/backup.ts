import { db, type RecoveryDatabase } from './database'
import type { DailyCheckIn, LocalProfile, YearExperiment } from '../domain/types'

export const BACKUP_FORMAT = '365-my-year'
export const BACKUP_VERSION = 1

export interface BackupData {
  profiles: LocalProfile[]
  experiments: YearExperiment[]
  dailyCheckIns: DailyCheckIn[]
}

export interface RecoveryBackup {
  format: typeof BACKUP_FORMAT
  version: typeof BACKUP_VERSION
  exportedAt: string
  data: BackupData
}

export type CsvRecordType = 'daily-check-ins' | 'year-experiments' | 'local-profiles'

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
    && (value.reflection === undefined || isString(value.reflection))
    && isString(value.updatedAt)
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
  if (value.version !== BACKUP_VERSION || !isString(value.exportedAt) || !isRecord(value.data)) {
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

  return value as unknown as RecoveryBackup
}

export async function createBackup(database: RecoveryDatabase = db): Promise<RecoveryBackup> {
  const [profiles, experiments, dailyCheckIns] = await database.transaction(
    'r',
    database.profiles,
    database.experiments,
    database.dailyCheckIns,
    () => Promise.all([
      database.profiles.toArray(),
      database.experiments.toArray(),
      database.dailyCheckIns.toArray(),
    ]),
  )
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data: { profiles, experiments, dailyCheckIns } }
}

export async function restoreBackup(backup: RecoveryBackup, database: RecoveryDatabase = db): Promise<void> {
  await database.transaction('rw', database.profiles, database.experiments, database.dailyCheckIns, async () => {
    await Promise.all([database.profiles.clear(), database.experiments.clear(), database.dailyCheckIns.clear()])
    await database.profiles.bulkPut(backup.data.profiles)
    await database.experiments.bulkPut(backup.data.experiments)
    await database.dailyCheckIns.bulkPut(backup.data.dailyCheckIns)
  })
}

export async function deleteAllData(database: RecoveryDatabase = db): Promise<void> {
  await database.transaction('rw', database.profiles, database.experiments, database.dailyCheckIns, () => Promise.all([
    database.profiles.clear(),
    database.experiments.clear(),
    database.dailyCheckIns.clear(),
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
    return csvRows(['id', 'experimentId', 'personalDate', 'status', 'alcoholFree', 'sleepHours', 'energy', 'mood', 'stress', 'reflection', 'updatedAt'], backup.data.dailyCheckIns)
  }
  if (recordType === 'year-experiments') {
    return csvRows(['id', 'profileId', 'startDate', 'createdAt'], backup.data.experiments)
  }
  return csvRows(['id', 'timezone', 'createdAt'], backup.data.profiles)
}