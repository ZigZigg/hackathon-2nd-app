import type { Page } from "@playwright/test"

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/login")
  await page.fill('input[name="email"], input[type="email"]', "admin@udika.com")
  await page.fill('input[name="password"], input[type="password"]', "password123")
  await page.click('button[type="submit"]')
  await page.waitForURL("**/dashboard", { timeout: 10000 })
}

export async function loginAsMember(page: Page): Promise<void> {
  await page.goto("/login")
  await page.fill('input[name="email"], input[type="email"]', "member@udika.com")
  await page.fill('input[name="password"], input[type="password"]', "password123")
  await page.click('button[type="submit"]')
  await page.waitForURL("**/dashboard", { timeout: 10000 })
}
