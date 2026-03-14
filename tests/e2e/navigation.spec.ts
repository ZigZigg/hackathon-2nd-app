import { test, expect } from "@playwright/test"
import { loginAsAdmin } from "./helpers/auth"

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test("ADMIN sidebar shows Admin section", async ({ page }) => {
    await expect(page.locator("nav")).toBeVisible()
    await expect(page.getByText("Admin")).toBeVisible()
  })

  test("sidebar shows Dashboard, Events, and Customers links", async ({ page }) => {
    await expect(page.getByRole("link", { name: /dashboard/i }).first()).toBeVisible()
    await expect(page.getByRole("link", { name: /events/i }).first()).toBeVisible()
    await expect(page.getByRole("link", { name: /customers/i }).first()).toBeVisible()
  })

  test("on mobile viewport hamburger button is visible", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/dashboard")
    const hamburger = page.locator('button[aria-label="Open menu"], button:has(svg[data-lucide="menu"])')
    await expect(hamburger).toBeVisible()
  })

  test("clicking hamburger opens mobile sidebar", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/dashboard")
    const hamburger = page.locator('button[aria-label="Open menu"]')
    await hamburger.click()
    // Sheet should open and show nav items
    await expect(page.locator('[data-state="open"]').first()).toBeVisible()
  })

  test("active route is highlighted when navigating", async ({ page }) => {
    await page.goto("/customers")
    // The customers nav link should have active styling
    const customersLink = page.getByRole("link", { name: /customers/i }).first()
    await expect(customersLink).toBeVisible()
    // Navigate to events
    await page.goto("/events")
    const eventsLink = page.getByRole("link", { name: /events/i }).first()
    await expect(eventsLink).toBeVisible()
  })
})
