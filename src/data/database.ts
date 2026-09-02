import Dexie, { type EntityTable } from 'dexie'
import type { DailyCheckIn, LocalProfile, YearExperiment } from '../domain/types'

export class RecoveryDatabase extends Dexie {
  profiles!: EntityTable<LocalProfile, 'id'>
  experiments!: EntityTable<YearExperiment, 'id'>
  dailyCheckIns!: EntityTable<DailyCheckIn, 'id'>

  constructor(name = 'myYear365') {
    super(name)
    this.version(1).stores({
      profiles: 'id',
      experiments: 'id, profileId, startDate',
      dailyCheckIns: 'id, experimentId, personalDate, [experimentId+personalDate]',
    })
  }
}

export const db = new RecoveryDatabase()

export async function createYearExperiment(startDate: string, timezone: string): Promise<void> {
  const createdAt = new Date().toISOString()
  await db.transaction('rw', db.profiles, db.experiments, async () => {
    await db.profiles.put({ id: 'local', timezone, createdAt })
    await db.experiments.put({ id: 'primary', profileId: 'local', startDate, createdAt })
  })
}

export function dailyCheckInId(experimentId: YearExperiment['id'], personalDate: string): string {
  return `${experimentId}:${personalDate}`
}

export async function saveDailyCheckIn(checkIn: DailyCheckIn): Promise<void> {
  await db.dailyCheckIns.put(checkIn)
}