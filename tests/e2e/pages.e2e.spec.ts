import { test, expect } from '@playwright/test'

const B = 'http://localhost:3005'

test.describe('Public pages (Phase 3)', () => {
  test.setTimeout(120_000)
  test('news list filters by theme and paginates', async ({ page }) => {
    await page.goto(`${B}/actualites`)
    await expect(page.getByRole('heading', { level: 1, name: 'Actualités & agenda' })).toBeVisible()
    await expect(page.getByText(/228 actualités/)).toBeVisible()

    await page.getByRole('link', { name: 'Cinéma', exact: true }).click()
    // First client navigation compiles the route in dev mode: allow time.
    await page.waitForURL(/theme=cinema/, { timeout: 60_000 })
    await expect(page.getByText(/\d+ actualités?/)).not.toHaveText(/228/)

    await page.goto(`${B}/actualites?page=2`)
    await expect(page.getByText('Page 2 sur')).toBeVisible()
  })

  test('article shows its event dates and related posts', async ({ page }) => {
    await page.goto(`${B}/actualites/bangoulap-au-coeur-du-livre-1ere-edition-a-la-fondation-jean-felicien-gacha`)
    await expect(page.getByRole('heading', { level: 1, name: /Bangoulap au coeur du livre/ })).toBeVisible()
    await expect(page.getByText('Du 13 au 20 janvier 2025').first()).toBeVisible()
    await expect(page.getByRole('heading', { name: 'À lire aussi' })).toBeVisible()
  })

  test('actions index lists the eight actions and opens one', async ({ page }) => {
    await page.goto(`${B}/actions`)
    await expect(page.locator('article')).toHaveCount(8)
    await page.getByRole('link', { name: 'Résidences d’artistes' }).first().click()
    await page.waitForURL(/\/actions\/residences$/, { timeout: 60_000 })
    await expect(page.getByRole('heading', { name: 'Ils ont été en résidence' })).toBeVisible()
    const residents = page.locator('section', { has: page.getByRole('heading', { name: 'Ils ont été en résidence' }) })
    await expect(residents.getByText('Sami Tchak')).toBeVisible()
  })

  test('CMS pages show their structured sections', async ({ page }) => {
    await page.goto(`${B}/sejourner/villa-boutanga`)
    await expect(page.getByRole('heading', { name: 'Chambres & suites' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Suite Boukarou' })).toBeVisible()

    await page.goto(`${B}/soutenir/don`)
    await expect(page.getByText('IBAN', { exact: true })).toBeVisible()

    await page.goto(`${B}/fondation/equipe`)
    await expect(page.getByText('Ly Dumas', { exact: true })).toBeVisible()
  })

  test('old WordPress URLs redirect to their new pages', async ({ page }) => {
    await page.goto(`${B}/activites/sante-et-social/`)
    await expect(page).toHaveURL(`${B}/actions/sante-social`)
    await page.goto(`${B}/creation-de-la-maison-gacha/`)
    await expect(page).toHaveURL(`${B}/actualites/creation-de-la-maison-gacha`)
  })

  test('unknown pages return a styled 404', async ({ page }) => {
    const res = await page.goto(`${B}/cette-page-n-existe-pas`)
    expect(res?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible()
  })

  test('sitemap lists the news posts', async ({ request }) => {
    const res = await request.get(`${B}/sitemap.xml`)
    expect(res.ok()).toBeTruthy()
    const xml = await res.text()
    expect((xml.match(/<url>/g) ?? []).length).toBeGreaterThan(240)
  })
})
