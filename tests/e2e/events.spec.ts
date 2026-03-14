import { test, expect } from "@playwright/test"
import { loginAsAdmin } from "./helpers/auth"

test.describe("Events", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/events")
  })

  test("events page loads and shows the event list", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /events/i })).toBeVisible()
    // List view should be default - table should be visible
    await expect(page.locator("table")).toBeVisible()
  })

  test("View toggle (List/Calendar) is present", async ({ page }) => {
    await expect(page.getByRole("button", { name: /list/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /calendar/i })).toBeVisible()
  })
})
