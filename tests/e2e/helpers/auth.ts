import type { Page } from "@playwright/test"

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/login")
  await page.fill("#email", "admin@udika.com")
  await page.fill("#password", "admin123!")
  await page.click('button[type="submit"]')
  await page.waitForURL("**/dashboard", { timeout: 15000 })
}
