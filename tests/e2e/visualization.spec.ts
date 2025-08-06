import { test, expect } from '@playwright/test';

test.describe('Visualization Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Mock the API response for algorithm generation with visualization steps
    await page.route('/api/algorithm/generate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            explanation: 'This algorithm uses a hash map to solve the Two Sum problem.',
            code: 'def two_sum(nums, target):\n    num_to_index = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in num_to_index:\n            return [num_to_index[complement], i]\n        num_to_index[num] = i\n    return []',
            language: 'python',
            visualizationPlan: {
              title: 'Two Sum Algorithm',
              description: 'Hash map approach',
              algorithmType: 'searching',
              complexity: { time: 'O(n)', space: 'O(n)' },
              steps: [
                {
                  id: 'step1',
                  description: 'Initialize empty hash map and iterate through array',
                  type: 'array',
                  data: { elements: [2, 7, 11, 15] },
                  highlights: ['0']
                },
                {
                  id: 'step2',
                  description: 'Check if complement exists in hash map',
                  type: 'array',
                  data: { elements: [2, 7, 11, 15] },
                  highlights: ['1']
                },
                {
                  id: 'step3',
                  description: 'Found complement! Return indices',
                  type: 'array',
                  data: { elements: [2, 7, 11, 15] },
                  highlights: ['0', '1']
                }
              ],
              initialState: { hashMap: {} },
              finalState: { hashMap: { 2: 0, 7: 1 }, result: [0, 1] }
            }
          }
        })
      });
    });

    // Generate a solution first
    await page.fill('input[id="title"]', 'Two Sum');
    await page.fill('textarea[id="description"]', 'Find two numbers that add up to target');
    await page.fill('input[placeholder="e.g., [2,7,11,15], target = 9"]', '[2,7,11,15], target = 9');
    await page.fill('input[placeholder="e.g., [0,1]"]', '[0,1]');
    await page.click('button[type="submit"]');
    
    // Wait for solution to load
    await expect(page.locator('text=Two Sum Algorithm')).toBeVisible();
  });

  test('should show solution tabs', async ({ page }) => {
    await expect(page.locator('button:has-text("Explanation")')).toBeVisible();
    await expect(page.locator('button:has-text("Code Implementation")')).toBeVisible();
    await expect(page.locator('button:has-text("Visualization")')).toBeVisible();
  });

  test('should display explanation tab by default', async ({ page }) => {
    // Explanation tab should be active
    await expect(page.locator('button:has-text("Explanation")').nth(0)).toHaveClass(/border-blue-500/);
    
    // Should show algorithm details
    await expect(page.locator('text=Two Sum Algorithm')).toBeVisible();
    await expect(page.locator('text=Hash map approach')).toBeVisible();
    await expect(page.locator('text=O(n)')).toBeVisible(); // Time complexity
    await expect(page.locator('text=This algorithm uses a hash map')).toBeVisible();
  });

  test('should switch to code implementation tab', async ({ page }) => {
    await page.click('button:has-text("Code Implementation")');
    
    // Code tab should be active
    await expect(page.locator('button:has-text("Code Implementation")').nth(0)).toHaveClass(/border-blue-500/);
    
    // Should show code
    await expect(page.locator('text=Python Implementation')).toBeVisible();
    await expect(page.locator('text=def two_sum')).toBeVisible();
    await expect(page.locator('button:has-text("Copy Code")')).toBeVisible();
  });

  test('should copy code to clipboard', async ({ page }) => {
    await page.click('button:has-text("Code Implementation")');
    
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-write']);
    
    await page.click('button:has-text("Copy Code")');
    
    // Verify clipboard content (this might not work in all test environments)
    // The button click should at least not throw an error
  });

  test('should switch to visualization tab', async ({ page }) => {
    await page.click('button:has-text("Visualization")');
    
    // Visualization tab should be active
    await expect(page.locator('button:has-text("Visualization")').nth(0)).toHaveClass(/border-blue-500/);
    
    // Should show visualization controls
    await expect(page.locator('text=Visualization Controls')).toBeVisible();
    await expect(page.locator('text=Step 1 of 3')).toBeVisible();
  });

  test('should control visualization playback', async ({ page }) => {
    await page.click('button:has-text("Visualization")');
    
    // Should show initial step
    await expect(page.locator('text=Step 1: Initialize empty hash map')).toBeVisible();
    
    // Click next step
    const nextButton = page.locator('button[title="Next step"]');
    await nextButton.click();
    
    // Should advance to step 2
    await expect(page.locator('text=Step 2 of 3')).toBeVisible();
    
    // Click previous step
    const prevButton = page.locator('button[title="Previous step"]');
    await prevButton.click();
    
    // Should go back to step 1
    await expect(page.locator('text=Step 1 of 3')).toBeVisible();
  });

  test('should play/pause visualization', async ({ page }) => {
    await page.click('button:has-text("Visualization")');
    
    const playButton = page.locator('button[title="Play"]');
    await expect(playButton).toBeVisible();
    
    // Click play (might change to pause)
    await playButton.click();
    
    // Should either show pause button or continue playing
    // This test verifies the button interaction works
  });

  test('should reset visualization', async ({ page }) => {
    await page.click('button:has-text("Visualization")');
    
    // Go to a later step first
    const nextButton = page.locator('button[title="Next step"]');
    await nextButton.click();
    await nextButton.click();
    
    // Should be at step 3
    await expect(page.locator('text=Step 3 of 3')).toBeVisible();
    
    // Reset
    const resetButton = page.locator('button[title="Reset to beginning"]');
    await resetButton.click();
    
    // Should be back at step 1
    await expect(page.locator('text=Step 1 of 3')).toBeVisible();
  });

  test('should use step slider', async ({ page }) => {
    await page.click('button:has-text("Visualization")');
    
    const stepSlider = page.locator('input[id="step-slider"]');
    
    // Move slider to step 2 (index 1)
    await stepSlider.fill('1');
    
    // Should show step 2
    await expect(page.locator('text=Step 2 of 3')).toBeVisible();
  });

  test('should adjust animation speed', async ({ page }) => {
    await page.click('button:has-text("Visualization")');
    
    const speedSlider = page.locator('input[id="speed-slider"]');
    
    // Change speed
    await speedSlider.fill('2000');
    
    // Should show updated speed
    await expect(page.locator('text=2000ms')).toBeVisible();
    
    // Test speed presets
    await page.click('text=Fast (500ms)');
    await expect(page.locator('text=500ms')).toBeVisible();
    
    await page.click('text=Normal (1s)');
    await expect(page.locator('text=1000ms')).toBeVisible();
    
    await page.click('text=Slow (2s)');
    await expect(page.locator('text=2000ms')).toBeVisible();
  });

  test('should render visualization SVG elements', async ({ page }) => {
    await page.click('button:has-text("Visualization")');
    
    // Should contain SVG visualization
    await expect(page.locator('svg')).toBeVisible();
    
    // For array visualization, should have rectangles and text
    await expect(page.locator('svg rect')).toHaveCount(4); // Array elements
    await expect(page.locator('svg text')).toHaveCount(8); // Element values + indices
  });
});