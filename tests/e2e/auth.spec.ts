import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("login with valid credentials navigates to /dashboard", async ({ page }) => {
    await page.goto("/login")
    await page.fill("#email", "admin@udika.com")
    await page.fill("#password", "admin123!")
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
  })

  test("login with invalid credentials stays on /login and shows error", async ({ page }) => {
    await page.goto("/login")
    await page.fill("#email", "wrong@example.com")
    await page.fill("#password", "wrongpassword")
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
    await expect(page.locator("text=Invalid email or password")).toBeVisible()
  })

  test("visiting /dashboard without session redirects to /login", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })
})
