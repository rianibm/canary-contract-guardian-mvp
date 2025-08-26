const { test, expect } = require("@playwright/test");

// Test configuration
const TEST_CONFIG = {
  contractId: "uxrrr-q7777-77774-qaaaq-cai",
  nickname: "Test Contract",
  baseUrl: "http://localhost:3000",
  credentials: {
    email: "testingcanary@gmail.com",
    password: "BrR123**"
  }
};

test.describe("Canary Contract Guardian - Complete Flow", () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto(TEST_CONFIG.baseUrl);
    
    // Wait for the page to load completely
    await page.waitForLoadState("domcontentloaded");
    
    // Wait for the main dashboard to be visible
    await page.waitForSelector('[data-testid="dashboard"], .max-w-6xl', { timeout: 10000 });
  });

  test("Complete contract monitoring flow with authentication", async ({ page }) => {
    // Step 1: Verify initial state (not logged in)
    await test.step("Verify initial logged-out state", async () => {
      // Should see "Unlock Full Features" button
      await expect(page.locator('button:has-text("Unlock Full Features")')).toBeVisible();
      
      // Should see hero section
      await expect(page.locator('text="Protect Your Contracts"')).toBeVisible();
    });

    // Step 2: Attempt to add contract without login
    await test.step("Try to add contract without login", async () => {
      // Scroll to add contract section
      await page.locator('[data-add-contract]').scrollIntoViewIfNeeded();
      
      // Fill contract form
      await page.fill('input[placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"]', TEST_CONFIG.contractId);
      await page.fill('input[placeholder="e.g., Main DEX Contract"]', TEST_CONFIG.nickname);
      
      // Click Start Monitoring
      await page.click('button:has-text("Start Monitoring")');
      
      // Should be able to add contract even without login
      await expect(page.locator('text="Successfully started monitoring"')).toBeVisible({ timeout: 5000 });
    });

    // Step 3: Login to access full features
    await test.step("Login to unlock advanced features", async () => {
      // Click "Unlock Full Features" button
      await page.click('button:has-text("Unlock Full Features")');
      
      // Wait for login modal to appear
      await expect(page.locator('text="Welcome Back"')).toBeVisible();
      
      // Fill login credentials
      await page.fill('input[type="email"]', TEST_CONFIG.credentials.email);
      await page.fill('input[type="password"]', TEST_CONFIG.credentials.password);
      
      // Submit login
      await page.click('button:has-text("Sign In")');
      
      // Wait for login to complete
      await expect(page.locator('text="Welcome back, Testing Canary"')).toBeVisible({ timeout: 5000 });
      
      // Should now see "Profile" button instead of "Unlock Full Features"
      await expect(page.locator('button:has-text("Profile")')).toBeVisible();
    });

    // Step 4: Verify contract appears in monitoring list
    await test.step("Verify contract in monitored list", async () => {
      // Should be on "Monitored" tab by default
      await expect(page.locator('button:has-text("Monitored")').nth(0)).toHaveClass(/border-orange-500|text-orange-600/);
      
      // Contract should be visible in the list
      await expect(page.locator(`text=${TEST_CONFIG.contractId}`)).toBeVisible();
      await expect(page.locator(`text=${TEST_CONFIG.nickname}`)).toBeVisible();
      
      // Should show healthy status
      await expect(page.locator('span:has-text("Healthy")')).toBeVisible();
    });

    // Step 5: Test Stop Monitor functionality (only available when logged in)
    await test.step("Test Stop Monitor functionality", async () => {
      // Find the contract row and click Stop Monitor button
      const contractRow = page.locator(`text=${TEST_CONFIG.contractId}`).locator('..').locator('..');
      
      // Should see Stop Monitor button (only visible when logged in)
      const stopButton = contractRow.locator('button:has-text("🛑 Stop Monitor")');
      await expect(stopButton).toBeVisible();
      
      // Click Stop Monitor
      await stopButton.click();
      
      // Verify success message
      await expect(page.locator('text="monitoring frozen"')).toBeVisible({ timeout: 5000 });
    });

    // Step 6: Check "Not Monitored" tab
    await test.step("Verify contract in not monitored tab", async () => {
      // Click "Not Monitored" tab
      await page.click('button:has-text("Not Monitored")');
      
      // Contract should appear in this tab
      await expect(page.locator(`text=${TEST_CONFIG.contractId}`)).toBeVisible();
      
      // Should show "Frozen" status
      await expect(page.locator('span:has-text("Frozen")')).toBeVisible();
      
      // Should see Unfreeze button (only visible when logged in)
      const unfreezeButton = page.locator('button:has-text("❄️ Unfreeze")');
      await expect(unfreezeButton).toBeVisible();
    });

    // Step 7: Test Unfreeze functionality
    await test.step("Test Unfreeze functionality", async () => {
      // Click Unfreeze button
      await page.click('button:has-text("❄️ Unfreeze")');
      
      // Verify success message
      await expect(page.locator('text="unfrozen successfully"')).toBeVisible({ timeout: 5000 });
    });

    // Step 8: Verify contract returns to monitored state
    await test.step("Verify contract returns to monitored", async () => {
      // Switch back to Monitored tab
      await page.click('button:has-text("Monitored")');
      
      // Contract should be back in monitored list
      await expect(page.locator(`text=${TEST_CONFIG.contractId}`)).toBeVisible();
      await expect(page.locator('span:has-text("Healthy")')).toBeVisible();
    });

    // Step 9: Test Chat functionality
    await test.step("Test AI Chat functionality", async () => {
      // Click Chat with AI Agent button
      await page.click('button:has-text("Chat with AI Agent")');
      
      // Wait for chat modal to open
      await expect(page.locator('text="AI Agent Chat"')).toBeVisible();
      
      // Should see initial agent message
      await expect(page.locator('text="Hello! I\'m your smart contract guardian"')).toBeVisible();
      
      // Test sending a message
      await page.fill('input[placeholder*="Type your message"]', `monitor ${TEST_CONFIG.contractId}`);
      await page.click('button:has-text("Send")');
      
      // Should see user message
      await expect(page.locator(`text=monitor ${TEST_CONFIG.contractId}`)).toBeVisible();
      
      // Close chat modal
      await page.click('button[aria-label*="close"], .text-2xl:has-text("×")');
    });

    // Step 10: Test search functionality
    await test.step("Test contract search", async () => {
      // Use the contract search input
      await page.fill('input[placeholder*="Search contracts"]', TEST_CONFIG.nickname);
      
      // Should filter and show only matching contract
      await expect(page.locator(`text=${TEST_CONFIG.contractId}`)).toBeVisible();
      
      // Clear search
      await page.click('button:has-text("×")'); // Clear search button
      
      // All contracts should be visible again
      await expect(page.locator(`text=${TEST_CONFIG.contractId}`)).toBeVisible();
    });

    // Step 11: Test theme toggle
    await test.step("Test dark/light theme toggle", async () => {
      // Find theme toggle button in footer
      const themeButton = page.locator('button[aria-label*="Switch to"]');
      await themeButton.scrollIntoViewIfNeeded();
      
      // Click to toggle theme
      await themeButton.click();
      
      // Verify theme changed (check for dark class on html)
      await expect(page.locator('html')).toHaveClass(/dark/);
      
      // Toggle back to light theme
      await themeButton.click();
      
      // Verify back to light theme
      await expect(page.locator('html')).not.toHaveClass(/dark/);
    });
  });

  test("Error handling and validation", async ({ page }) => {
    // Test invalid contract address format
    await test.step("Test invalid contract address validation", async () => {
      await page.locator('[data-add-contract]').scrollIntoViewIfNeeded();
      
      // Enter invalid contract address
      await page.fill('input[placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"]', 'invalid-contract-id');
      await page.click('button:has-text("Start Monitoring")');
      
      // Should show validation error
      await expect(page.locator('text="Invalid contract address format"')).toBeVisible();
    });

    // Test login with invalid credentials
    await test.step("Test invalid login credentials", async () => {
      await page.click('button:has-text("Unlock Full Features")');
      
      // Try with wrong credentials
      await page.fill('input[type="email"]', 'wrong@email.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button:has-text("Sign In")');
      
      // Should show error message
      await expect(page.locator('text="Invalid email or password"')).toBeVisible();
    });
  });

  test("Responsive design verification", async ({ page }) => {
    // Test mobile viewport
    await test.step("Test mobile responsiveness", async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Key elements should still be visible and functional
      await expect(page.locator('button:has-text("Unlock Full Features")')).toBeVisible();
      
      // Contract form should be usable
      await page.locator('[data-add-contract]').scrollIntoViewIfNeeded();
      await expect(page.locator('input[placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"]')).toBeVisible();
    });

    // Test tablet viewport
    await test.step("Test tablet responsiveness", async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Layout should adapt appropriately
      await expect(page.locator('.max-w-6xl')).toBeVisible();
    });
  });
});
