import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export interface LoginOptions {
  page: Page
  serverURL?: string
  user: { email: string; password: string }
}

/** Logs into the team's admin (custom app at /admin). */
export async function login({ page, serverURL = 'http://localhost:3005', user }: LoginOptions): Promise<void> {
  await page.goto(`${serverURL}/admin/login`)
  await page.fill('input[name="email"]', user.email)
  await page.fill('input[name="password"]', user.password)
  await page.click('button[type="submit"]')
  await page.waitForURL(`${serverURL}/admin`)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Bonjour|Bonsoir/)
}
