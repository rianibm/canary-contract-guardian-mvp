const { test, expect } = require("@playwright/test");

const contractId = "uxrrr-q7777-77774-qaaaq-cai";

test("UI-Agent integration flow", async ({ page }) => {
  await page.goto(
    "https://fantastic-barnacle-vr9j4pqv65w3xrxv-3000.app.github.dev/"
  );

  // Tunggu input muncul
  await page.waitForSelector('input[placeholder*="xxxxx"]');

  // Masukkan contract ID dan klik Start Monitoring
  await page.fill(
    'input[placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"]',
    contractId
  );
  await page.click('button:has-text("Start Monitoring")');

  // Tab Monitored
  await page.click('button:has-text("Monitored")');
  await expect(page.locator(`text=${contractId}`)).toBeVisible();
  await expect(page.locator('span:has-text("Healthy")')).toBeVisible();

  // Freeze
  await page
    .locator(`text=${contractId}`)
    .locator("..")
    .locator('button:has-text("Freeze")')
    .click();

  // Tab Not Monitored
  await page.click('button:has-text("Not Monitored")');
  await expect(page.locator(`text=${contractId}`)).toBeVisible();
  await expect(page.locator('span:has-text("Freeze")')).toBeVisible();

  // Resume
  await page
    .locator(`text=${contractId}`)
    .locator("..")
    .locator('button:has-text("Resume")')
    .click();

  // Tab Monitored lagi
  await page.click('button:has-text("Monitored")');
  await expect(page.locator(`text=${contractId}`)).toBeVisible();
  await expect(page.locator('span:has-text("Healthy")')).toBeVisible();

  // Freeze lagi
  await page
    .locator(`text=${contractId}`)
    .locator("..")
    .locator('button:has-text("Freeze")')
    .click();
  await expect(page.locator('span:has-text("Freeze")')).toBeVisible();

  // Unfreeze
  await page
    .locator(`text=${contractId}`)
    .locator("..")
    .locator('button:has-text("❄️ Unfreeze")')
    .click();

  // Pastikan status healthy dan tombol Stop Monitor muncul
  await expect(page.locator(`text=${contractId}`)).toBeVisible();
  await expect(page.locator('span:has-text("Healthy")')).toBeVisible();
  await expect(page.locator('button:has-text("Stop Monitor")')).toBeVisible();
});
