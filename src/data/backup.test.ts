import { BACKUP_FORMAT, BACKUP_VERSION, backupCsv, parseBackup, type RecoveryBackup } from './backup'

const backup: RecoveryBackup = {
  format: BACKUP_FORMAT,
  version: BACKUP_VERSION,
  exportedAt: '2026-09-02T12:00:00.000Z',
  data: {
    profiles: [{ id: 'local', timezone: 'Europe/Amsterdam', createdAt: '2026-08-30T12:00:00.000Z' }],
    experiments: [{ id: 'primary', profileId: 'local', startDate: '2026-08-30', createdAt: '2026-08-30T12:00:00.000Z' }],
    dailyCheckIns: [{
      id: 'primary:2026-08-30', experimentId: 'primary', personalDate: '2026-08-30', status: 'draft',
      reflection: 'Quiet, reflective\nday', updatedAt: '2026-08-30T20:00:00.000Z',
    }],
  },
}

describe('backup format', () => {
  it('round trips supported records while preserving unknown observations', () => {
    expect(parseBackup(JSON.stringify(backup))).toEqual(backup)
    expect(parseBackup(JSON.stringify(backup)).data.dailyCheckIns[0].energy).toBeUndefined()
  })

  it('rejects invalid and newer backup files', () => {
    expect(() => parseBackup('not json')).toThrow('not valid JSON')
    expect(() => parseBackup(JSON.stringify({ ...backup, version: 2 }))).toThrow('newer version')
    expect(() => parseBackup(JSON.stringify({ ...backup, data: { ...backup.data, profiles: [{}] } }))).toThrow('invalid or incomplete')
    expect(() => parseBackup(JSON.stringify({ ...backup, data: { ...backup.data, experiments: [] } }))).toThrow('invalid or incomplete')
    expect(() => parseBackup(JSON.stringify({ ...backup, data: { ...backup.data, dailyCheckIns: [{ ...backup.data.dailyCheckIns[0], id: 'wrong' }] } }))).toThrow('invalid or incomplete')
  })

  it('exports record-specific CSV with escaped text and blank unknown values', () => {
    const csv = backupCsv(backup, 'daily-check-ins')
    expect(csv).toContain('personalDate,status,alcoholFree,sleepHours')
    expect(csv).toContain('draft,,,,,,"Quiet, reflective\nday"')
  })
})