import { test, expect, Page } from '@playwright/test'

import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

const B = 'http://localhost:3005'

test.describe('Admin (custom app)', () => {
  test.setTimeout(180_000)
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()
    page = await (await browser.newContext()).newPage()
    await login({ page, user: testUser })
  })
  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('is protected: anonymous visitors are sent to the login page', async ({ browser }) => {
    const anon = await (await browser.newContext()).newPage()
    await anon.goto(`${B}/admin/posts`)
    await expect(anon).toHaveURL(/\/admin\/login/)
  })

  test('dashboard shows figures and shortcuts', async () => {
    await page.goto(`${B}/admin`)
    await expect(page.getByRole('region', { name: 'Chiffres clés' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Administration' }).getByRole('link', { name: /Actualités/ })).toBeVisible()
  })

  test('news list searches and opens an article with the rich-text editor', async () => {
    await page.goto(`${B}/admin/posts?q=Maison+Gacha`)
    await expect(page.getByRole('table')).toBeVisible()
    await page.getByRole('table').getByRole('link').first().click()
    await expect(page).toHaveURL(/\/admin\/posts\/\d+/)
    await expect(page.locator('.ProseMirror')).toBeVisible()
    await expect(page.getByRole('button', { name: /Publier|Mettre à jour/ })).toBeVisible()
  })

  test('site settings can be saved', async () => {
    await page.goto(`${B}/admin/settings`)
    await page.getByRole('button', { name: 'Enregistrer' }).click()
    await expect(page.getByRole('status')).toContainText('Enregistré')
  })

  test('media library and team list load', async () => {
    await page.goto(`${B}/admin/media`)
    await expect(page.getByRole('button', { name: 'Importer des photos' })).toBeVisible()
    await page.goto(`${B}/admin/team`)
    await expect(page.getByRole('table')).toBeVisible()
  })

  test("Payload's own screens remain available at /cms", async () => {
    await page.goto(`${B}/cms`)
    await expect(page).toHaveURL(/\/cms/)
  })
})
