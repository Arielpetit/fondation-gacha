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
        .analyze()
      const summary = results.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target.join(' ')}`)
      expect(summary).toEqual([])
    })
  }

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
