import { test, expect } from '@playwright/test'

const B = 'http://localhost:3005'

// These tests never submit a valid form, so no message is stored or emailed.
test.describe('Forms & newsletter (Phase 4)', () => {
  test.setTimeout(120_000)

  test('contact form renders its fields and blocks an empty submit', async ({ page }) => {
    await page.goto(`${B}/contact`)
    const form = page.locator('#ecrire form')
    await expect(form.getByLabel('Nom et prénom')).toBeVisible()
    await expect(form.getByLabel('Sujet')).toBeVisible()
    await form.getByRole('button', { name: /Envoyer le message/ }).click()
    // Native validation keeps the form on screen; no confirmation appears.
    await expect(page.locator('#ecrire [role=status]')).toHaveCount(0)
    expect(await form.getByLabel('Nom et prénom').evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true)
  })

  test('Villa page has the booking form with dates and rooms', async ({ page }) => {
    await page.goto(`${B}/sejourner/villa-boutanga#reserver`)
    const form = page.locator('#reserver form')
    await expect(form.getByLabel('Arrivée')).toHaveAttribute('type', 'date')
    await expect(form.getByLabel('Chambre souhaitée').locator('option')).toHaveCount(10)
  })

  test('membership cards link to the online form', async ({ page }) => {
    await page.goto(`${B}/soutenir/adhesion`)
    await page.getByRole('link', { name: 'Adhérer' }).first().click()
    await expect(page.locator('#adherer form').getByLabel('Carte de membre')).toBeVisible()
  })

  test('English labels are used on /en', async ({ page }) => {
    await page.goto(`${B}/en/contact`)
    await expect(page.locator('#ecrire form').getByLabel('Full name')).toBeVisible()
  })

  test('newsletter endpoint validates and hides the subscriber list', async ({ request }) => {
    const bad = await request.post(`${B}/api-site/newsletter`, { data: { email: 'not-an-email' } })
    expect(bad.status()).toBe(400)
    const bot = await request.post(`${B}/api-site/newsletter`, { data: { email: 'bot@example.org', site_web: 'x' } })
    expect(bot.ok()).toBeTruthy()
    const list = await request.get(`${B}/api/subscribers`)
    expect(list.status()).toBe(403)
  })

  test('form submissions are private and bots are rejected', async ({ request }) => {
    expect((await request.get(`${B}/api/form-submissions`)).status()).toBe(403)
    const forms = await (await request.get(`${B}/api/forms?where[slug][equals]=contact&depth=0`)).json()
    const res = await request.post(`${B}/api/form-submissions`, {
      data: { form: forms.docs[0].id, submissionData: [{ field: 'site_web', value: 'http://spam.example' }] },
    })
    expect(res.status()).toBe(400)
  })

  test('preview route refuses anonymous visitors', async ({ request }) => {
    const res = await request.get(`${B}/next/preview?path=/`, { maxRedirects: 0 })
    expect(res.status()).toBe(403)
  })
})
