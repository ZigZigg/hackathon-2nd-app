import { test, expect } from "@playwright/test"
import { loginAsAdmin } from "./helpers/auth"

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test("authenticated user sees dashboard with metric cards", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible()
    // Metric cards or skeleton loaders should be present
    const hasMetrics = await page
      .locator(".grid")
      .first()
      .isVisible()
      .catch(() => false)
    expect(hasMetrics).toBe(true)
  })

  test("dashboard page has period selector (month and year)", async ({ page }) => {
    // Month select trigger should be present
    await expect(page.locator('[role="combobox"]').first()).toBeVisible()
    // Year input should be present
    await expect(page.locator('input[type="number"]')).toBeVisible()
  })
})
