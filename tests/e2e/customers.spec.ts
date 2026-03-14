import { test, expect } from "@playwright/test"
import { loginAsAdmin } from "./helpers/auth"

test.describe("Customers", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/customers")
  })

  test("customers page loads and shows the customer list table", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /customers/i })).toBeVisible()
    // Table should be present
    await expect(page.locator("table")).toBeVisible()
  })

  test("Add Customer button is present", async ({ page }) => {
    await expect(page.getByRole("button", { name: /add customer/i })).toBeVisible()
  })
})
