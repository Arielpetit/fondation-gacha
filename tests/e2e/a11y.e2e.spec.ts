import AxeBuilder from '@axe-core/playwright'
import { test, expect } from '@playwright/test'

const B = 'http://localhost:3005'

/** Every public template, in both languages. */
const PAGES = [
  '/',
  '/actualites',
  '/actualites/bangoulap-au-coeur-du-livre-1ere-edition-a-la-fondation-jean-felicien-gacha',
  '/actions',
  '/actions/residences',
  '/fondation',
  '/fondation/equipe',
  '/sejourner',
  '/sejourner/villa-boutanga',
  '/soutenir/don',
  '/soutenir/adhesion',
  '/contact',
  '/en',
  '/en/actualites/creation-de-la-maison-gacha',
  '/en/sejourner/visites',
]

test.describe('Accessibility (axe, WCAG 2.1 AA)', () => {
  test.setTimeout(180_000)

  for (const path of PAGES) {
    test(`no violations on ${path}`, async ({ page }) => {
      // Reduced motion: every element is in its final state, so contrast is measured on real colours.
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(`${B}${path}`, { waitUntil: 'networkidle' })
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('nextjs-portal') // Next.js dev overlay
        .exclude('iframe') // third-party embeds (YouTube): their markup is outside our control
        .analyze()
      const summary = results.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target.join(' ')}`)
      expect(summary).toEqual([])
    })
  }

  // Dark theme (follows the system preference on first visit).
  for (const path of ['/', '/actualites', '/sejourner/villa-boutanga', '/soutenir/don', '/contact', '/en/actions']) {
    test(`no violations in dark theme on ${path}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' })
      await page.goto(`${B}${path}`, { waitUntil: 'networkidle' })
      await expect(page.locator('html')).toHaveClass(/dark/)
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('nextjs-portal')
        .exclude('iframe')
        .analyze()
      expect(results.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target.join(' ')}`)).toEqual([])
    })
  }

  test('theme toggle switches and remembers the choice', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(`${B}/`)
    await expect(page.locator('html')).not.toHaveClass(/dark/)
    await page.getByRole('button', { name: 'Passer en thème sombre' }).first().click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.reload()
    await expect(page.locator('html')).toHaveClass(/dark/)
  })

  test('mobile menu dialog has no violations', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(`${B}/`)
    await page.getByRole('button', { name: 'Menu' }).click()
    await page.getByRole('dialog', { name: 'Menu' }).waitFor()
    const results = await new AxeBuilder({ page }).include('#mobile-menu').withTags(['wcag2a', 'wcag2aa']).analyze()
    expect(results.violations.map((v) => v.id)).toEqual([])
  })
})
