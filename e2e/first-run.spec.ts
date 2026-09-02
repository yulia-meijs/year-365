import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test('creates, reloads, and opens a Year Experiment offline on mobile', async ({ context, page }) => {
  const runtimeErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'A year to notice what helps.' })).toBeVisible()
  await expect(page.getByLabel('Start date')).toHaveValue('2026-08-30')

  const today = new Date()
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  await page.getByLabel('Start date').fill(localToday)
  await page.getByRole('button', { name: 'Begin my year' }).click()

  await expect(page.getByRole('heading', { name: 'Day 1 of 365' })).toBeVisible()
  await expect(page.getByText('No observations yet').first()).toBeVisible()
  await page.getByRole('button', { name: 'Use dark theme' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Day 1 of 365' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Use light theme' })).toBeVisible()

  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true))
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Day 1 of 365' })).toBeVisible()
  await context.setOffline(false)

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(hasHorizontalOverflow).toBe(false)
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible()
  expect(runtimeErrors).toEqual([])
})

test('keeps primary navigation available across every app screen', async ({ page }) => {
  await page.goto('/')
  const today = new Date()
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  await page.getByLabel('Start date').fill(localToday)
  await page.getByRole('button', { name: 'Begin my year' }).click()

  const navigation = page.getByRole('navigation', { name: 'Primary navigation' })
  await expect(navigation).toBeVisible()

  await navigation.getByRole('button', { name: 'Check-in', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'How was today?' })).toBeVisible()
  await expect(navigation).toBeVisible()
  await expect(navigation.getByRole('button', { name: 'Check-in', exact: true })).toHaveAttribute('aria-current', 'page')

  await navigation.getByRole('button', { name: 'Calendar', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Calendar', exact: true })).toBeVisible()
  await expect(navigation).toBeVisible()

  await navigation.getByRole('button', { name: 'Trends', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Trends', exact: true })).toBeVisible()
  await expect(navigation).toBeVisible()

  await navigation.getByRole('button', { name: 'You', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'You', exact: true })).toBeVisible()
  await expect(navigation).toBeVisible()

  await navigation.getByRole('button', { name: 'Today', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Day 1 of 365' })).toBeVisible()
  await expect(navigation.getByRole('button', { name: 'Today', exact: true })).toHaveAttribute('aria-current', 'page')
})

test('restores a partial check-in and completes the default measures', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  await page.goto('/')
  const today = new Date()
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  await page.getByLabel('Start date').fill(localToday)
  await page.getByRole('button', { name: 'Begin my year' }).click()
  await page.getByRole('button', { name: 'Start check-in' }).click()

  await page.getByRole('button', { name: 'Yes', exact: true }).click()
  await page.getByLabel('Hours of sleep').fill('7.5')
  await page.getByLabel('Sport or activity').fill('Swimming')
  await page.getByLabel('Minutes').fill('40')
  await expect(page.getByText('Saving...')).toBeVisible()
  await expect(page.getByText('Saved locally')).toBeVisible()

  await page.reload()
  await page.getByRole('button', { name: 'Continue check-in' }).click()
  await expect(page.getByRole('button', { name: 'Yes', exact: true })).toHaveClass(/selected/)
  await expect(page.getByLabel('Hours of sleep')).toHaveValue('7.5')
  await expect(page.getByLabel('Sport or activity')).toHaveValue('Swimming')
  await expect(page.getByLabel('Minutes')).toHaveValue('40')
  await expect(page.getByRole('button', { name: 'Complete check-in' })).toBeDisabled()

  await page.getByRole('button', { name: 'Energy 7 out of 10' }).click()
  await page.getByRole('button', { name: 'Mood 8 out of 10' }).click()
  await page.getByRole('button', { name: 'Stress 3 out of 10' }).click()
  await page.getByLabel('How was today?').fill('A quiet walk helped.')
  await expect(page.getByText('Saved locally')).toBeVisible()
  await page.getByRole('button', { name: 'Complete check-in' }).click()

  await expect(page.getByText('7.5 hours sleep · Energy 7')).toBeVisible()
  await expect(page.getByText('Swimming · 40 min')).toBeVisible()
  await expect(page.getByText('Mood 8/10 · Stress 3/10')).toBeVisible()

  await page.getByRole('button', { name: 'Calendar', exact: true }).click()
  await page.getByRole('button', { name: 'Sport', exact: true }).click()
  const sportDay = page.getByRole('button', { name: /sport: Swimming, 40 minutes/ })
  await expect(sportDay).toHaveClass(/has-sport/)
  await expect(sportDay.locator('.sport-progress')).toHaveCSS('background-color', 'rgb(15, 138, 104)')

  await page.getByRole('button', { name: 'Trends', exact: true }).click()
  await expect(page.getByRole('img', { name: /^Sport\. 1 recorded observation/ })).toBeVisible()
  expect(runtimeErrors).toEqual([])
})

test('opens historical check-ins from Calendar and keeps future days unavailable', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  await page.goto('/')
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const startDate = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  await page.getByLabel('Start date').fill(startDate)
  await page.getByRole('button', { name: 'Begin my year' }).click()
  await page.getByRole('button', { name: 'Calendar', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Calendar', exact: true })).toBeVisible()
  const historicalDay = page.getByRole('button', { name: /Day 1: Not recorded/ })
  await expect(historicalDay).toBeEnabled()
  await expect(page.getByRole('button', { name: /Day 3: Future day/ })).toBeDisabled()

  await historicalDay.click()
  await expect(page.getByText(`Daily check-in · ${startDate}`)).toBeVisible()
  await page.getByRole('button', { name: 'Yes', exact: true }).click()
  await expect(page.getByText('Saved locally')).toBeVisible()
  await page.getByRole('button', { name: 'Back to Calendar' }).click()

  await expect(page.getByRole('button', { name: /Day 1: Partial check-in/ })).toBeVisible()
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(hasHorizontalOverflow).toBe(false)
  expect(runtimeErrors).toEqual([])
})

test('opens Calendar at today and can return focus to it', async ({ page }) => {
  await page.goto('/')
  const start = new Date()
  start.setDate(start.getDate() - 120)
  const startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
  await page.getByLabel('Start date').fill(startDate)
  await page.getByRole('button', { name: 'Begin my year' }).click()
  await page.getByRole('button', { name: 'Calendar', exact: true }).click()

  const today = page.locator('.calendar-day.today')
  await expect(today).toBeInViewport()

  await page.evaluate(() => window.scrollTo({ top: 0 }))
  await page.getByRole('button', { name: 'Jump to today' }).click()
  await expect(today).toBeFocused()
  await expect(today).toBeInViewport()
})

test('shows recorded trend observations without counting unknown days', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  await page.goto('/')
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const startDate = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  await page.getByLabel('Start date').fill(startDate)
  await page.getByRole('button', { name: 'Begin my year' }).click()
  await page.getByRole('button', { name: 'Start check-in' }).click()

  await page.getByRole('button', { name: 'Yes', exact: true }).click()
  await page.getByLabel('Hours of sleep').fill('7')
  await page.getByRole('button', { name: 'Energy 8 out of 10' }).click()
  await page.getByRole('button', { name: 'Mood 7 out of 10' }).click()
  await page.getByRole('button', { name: 'Stress 3 out of 10' }).click()
  await expect(page.getByText('Saved locally')).toBeVisible()
  await page.getByRole('button', { name: 'Complete check-in' }).click()

  await page.getByRole('button', { name: 'Trends', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Trends', exact: true })).toBeVisible()
  await expect(page.getByText('1 recorded observation. Average 7h; latest 7h; range 7 to 7h. Unknown days are excluded.')).toBeVisible()
  await expect(page.getByRole('img', { name: /Energy.*1 recorded observation.*Unknown days are excluded/ })).toBeVisible()

  await page.getByRole('tab', { name: 'Lifestyle' }).click()
  await expect(page.getByText('1 recorded alcohol observation: 1 alcohol-free and 0 alcohol recorded. Unknown days are excluded.')).toBeVisible()
  await page.getByRole('button', { name: '7 days' }).click()
  await expect(page.getByText(/Showing up to 7 days through/)).toBeVisible()

  await page.getByRole('tab', { name: 'Life', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Your life trends will grow here.' })).toBeVisible()
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(hasHorizontalOverflow).toBe(false)
  expect(runtimeErrors).toEqual([])
})

test('explores creative projects and things to try without requiring deadlines', async ({ page }) => {
  await page.goto('/')
  const today = new Date()
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  await page.getByLabel('Start date').fill(localToday)
  await page.getByRole('button', { name: 'Begin my year' }).click()
  await page.getByRole('button', { name: 'Open projects' }).click()

  await expect(page.getByRole('heading', { name: 'Return to Sewing' })).toBeVisible()
  await page.getByLabel('Return to Sewing status').selectOption('active')
  await page.getByLabel('Minutes for Return to Sewing').fill('45')
  await page.getByRole('article').filter({ hasText: 'Return to Sewing' }).getByRole('button', { name: 'Add', exact: true }).click()
  await expect(page.getByText('45 min')).toBeVisible()
  await page.getByText('Find sewing machine').click()
  await expect(page.getByText('1 of 8')).toBeVisible()

  await page.getByRole('button', { name: 'New project' }).click()
  await page.getByLabel('Project name').fill('Make a dress')
  await page.getByLabel('Description').fill('Learn by making something I would enjoy wearing.')
  await page.getByRole('button', { name: 'Create project' }).click()
  await expect(page.getByRole('heading', { name: 'Make a dress' })).toBeVisible()

  await page.getByRole('tab', { name: 'Things to try' }).click()
  await page.getByPlaceholder('Pottery, photography, dancing...').fill('Pottery')
  await page.getByRole('button', { name: 'Add idea' }).click()
  await page.getByLabel('Pottery exploration state').selectOption('interested')

  await page.reload()
  await page.getByRole('button', { name: 'Open projects' }).click()
  await expect(page.getByRole('heading', { name: 'Make a dress' })).toBeVisible()
  await expect(page.getByLabel('Return to Sewing status')).toHaveValue('active')
  await page.getByRole('tab', { name: 'Things to try' }).click()
  await expect(page.getByLabel('Pottery exploration state')).toHaveValue('interested')
  await page.getByRole('button', { name: 'Remove Pottery' }).click()
  await expect(page.getByRole('heading', { name: 'Pottery' })).not.toBeVisible()
})

test('keeps a personal chapter of up to ten life rules', async ({ page }) => {
  await page.goto('/')
  const today = new Date()
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  await page.getByLabel('Start date').fill(localToday)
  await page.getByRole('button', { name: 'Begin my year' }).click()
  await page.getByRole('button', { name: 'Open projects' }).click()
  await page.getByRole('tab', { name: 'Life rules' }).click()

  await page.getByLabel('New life rule').fill('Rest is part of the work.')
  await page.getByRole('button', { name: 'Add rule' }).click()
  await page.getByLabel('Life rule 1', { exact: true }).fill('Rest makes the work sustainable.')
  await page.getByRole('button', { name: 'Save life rule 1' }).click()

  await page.reload()
  await page.getByRole('button', { name: 'Open projects' }).click()
  await page.getByRole('tab', { name: 'Life rules' }).click()
  await expect(page.getByLabel('Life rule 1', { exact: true })).toHaveValue('Rest makes the work sustainable.')
  await page.getByRole('button', { name: 'Remove life rule 1' }).click()

  for (let number = 1; number <= 10; number += 1) {
    await page.getByLabel('New life rule').fill(`Life rule number ${number}.`)
    await page.getByRole('button', { name: 'Add rule' }).click()
  }

  await expect(page.getByText('10 of 10 sentences')).toBeVisible()
  await expect(page.getByLabel('New life rule')).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Add rule' })).toBeDisabled()
  await expect(page.getByLabel('Life rule 10', { exact: true })).toHaveValue('Life rule number 10.')
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(hasHorizontalOverflow).toBe(false)
})

test('exports, deletes, and restores all local data from You', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  await page.goto('/')
  const today = new Date()
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  await page.getByLabel('Start date').fill(localToday)
  await page.getByRole('button', { name: 'Begin my year' }).click()
  await page.getByRole('button', { name: 'Start check-in' }).click()
  await page.getByRole('button', { name: 'Yes', exact: true }).click()
  await expect(page.getByText('Saved locally')).toBeVisible()
  await page.getByRole('button', { name: 'Back to Today' }).click()
  await page.getByRole('button', { name: 'You', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'You', exact: true })).toBeVisible()
  await expect(page.getByText('Everything is stored in this browser. No account, analytics, cloud sync, or data sharing.')).toBeVisible()
  await expect(page.getByText('Daily Check-Ins').locator('..').getByText('1')).toBeVisible()

  await page.getByLabel('Choose JSON backup').setInputFiles({ name: 'newer.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: '365-my-year', version: 4 })) })
  await expect(page.getByRole('alert')).toHaveText('This backup was created by a newer version of the app.')
  await expect(page.getByText('Daily Check-Ins').locator('..').getByText('1')).toBeVisible()

  const jsonDownloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download JSON backup' }).click()
  const jsonDownload = await jsonDownloadPromise
  expect(jsonDownload.suggestedFilename()).toMatch(/^365-my-year-backup-\d{4}-\d{2}-\d{2}\.json$/)
  const jsonPath = await jsonDownload.path()
  expect(jsonPath).not.toBeNull()
  const backupText = await readFile(jsonPath!, 'utf8')
  const downloadedBackup = JSON.parse(backupText)
  expect(downloadedBackup).toMatchObject({ format: '365-my-year', version: 3 })
  expect(downloadedBackup.data.dailyCheckIns).toHaveLength(1)
  expect(downloadedBackup.data.dailyCheckIns[0].energy).toBeUndefined()

  const csvDownloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download CSV' }).click()
  const csvDownload = await csvDownloadPromise
  const csvPath = await csvDownload.path()
  expect(csvPath).not.toBeNull()
  const csvText = await readFile(csvPath!, 'utf8')
  expect(csvText).toContain('personalDate,status,alcoholFree')
  expect(csvText).toContain(`${localToday},draft,true`)

  await page.getByRole('button', { name: 'Review deletion' }).click()
  await expect(page.getByRole('button', { name: 'Download backup' })).toBeVisible()
  const deleteButton = page.getByRole('button', { name: 'Delete everything' })
  await expect(deleteButton).toBeDisabled()
  await page.getByLabel(/Type DELETE MY DATA to confirm/).fill('DELETE MY DATA')
  await expect(deleteButton).toBeEnabled()
  await deleteButton.click()

  await expect(page.getByRole('heading', { name: 'A year to notice what helps.' })).toBeVisible()
  await page.getByLabel('Choose JSON backup').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(backupText) })
  await expect(page.getByText('Backup ready to restore')).toBeVisible()
  await page.getByRole('button', { name: 'Replace local data' }).click()

  await expect(page.getByRole('heading', { name: 'Day 1 of 365' })).toBeVisible()
  await page.getByRole('button', { name: 'You', exact: true }).click()
  await expect(page.getByText('Daily Check-Ins').locator('..').getByText('1')).toBeVisible()
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(hasHorizontalOverflow).toBe(false)
  expect(runtimeErrors).toEqual([])
})