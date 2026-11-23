import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('French homepage renders at /', async ({ page }) => {
    await page.goto('http://localhost:3005')
    await expect(page).toHaveTitle(/Fondation Jean-Félicien Gacha/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    // SplitText exposes the heading text through aria-label.
    await expect(
      page.getByRole('heading', { level: 1, name: "La reconnaissance de l'autre et de ses valeurs" }),
    ).toBeVisible()
  })

  test('mobile menu opens and lists sections', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('http://localhost:3005')
    await page.getByRole('button', { name: 'Menu' }).click()
    const dialog = page.getByRole('dialog', { name: 'Menu' })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Nos actions' }).click()
    await expect(dialog.getByRole('link', { name: 'Formation professionnelle' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('design system page renders without errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto('http://localhost:3005/styleguide')
    await expect(page.getByRole('heading', { level: 1, name: /système de design/ })).toBeVisible()
    expect(errors).toEqual([])
  })

  test('English homepage renders at /en', async ({ page }) => {
    await page.goto('http://localhost:3005/en')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Recognising others and their values' }),
    ).toBeVisible()
  })
})
