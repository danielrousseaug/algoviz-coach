import { test, expect } from '@playwright/test';

test.describe('Algorithm Generation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show problem input form on homepage', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('AlgoViz Coach');
    await expect(page.locator('h2')).toContainText('Learn Algorithms Visually');
    
    // Check problem input form elements
    await expect(page.locator('input[id="title"]')).toBeVisible();
    await expect(page.locator('textarea[id="description"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Generate Algorithm Solution');
  });

  test('should validate required fields', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Should show error for missing required fields
    await expect(page.locator('.text-red-700')).toBeVisible();
  });

  test('should handle problem input form interactions', async ({ page }) => {
    // Fill in the problem details
    await page.fill('input[id="title"]', 'Two Sum');
    await page.fill('textarea[id="description"]', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.');
    
    // Add example
    await page.fill('input[placeholder="e.g., [2,7,11,15], target = 9"]', '[2,7,11,15], target = 9');
    await page.fill('input[placeholder="e.g., [0,1]"]', '[0,1]');
    
    // Check if submit button is enabled
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).not.toBeDisabled();
  });

  test('should add and remove examples', async ({ page }) => {
    // Check initial state - should have one example
    await expect(page.locator('text=Example 1')).toBeVisible();
    
    // Add another example
    await page.click('text=+ Add Example');
    await expect(page.locator('text=Example 2')).toBeVisible();
    
    // Remove the second example
    await page.click('button:has-text("Remove")');
    await expect(page.locator('text=Example 2')).not.toBeVisible();
  });

  test('should add and remove constraints', async ({ page }) => {
    // Add constraint
    await page.click('text=+ Add Constraint');
    await page.fill('input[placeholder="e.g., 1 <= nums.length <= 10^4"]', '2 <= nums.length <= 10^4');
    
    // Add another constraint
    await page.click('text=+ Add Constraint');
    
    // Should have multiple constraint inputs
    const constraintInputs = page.locator('input[placeholder="e.g., 1 <= nums.length <= 10^4"]');
    await expect(constraintInputs).toHaveCount(2);
  });

  test('should handle difficulty selection', async ({ page }) => {
    const difficultySelect = page.locator('select');
    
    // Check default value
    await expect(difficultySelect).toHaveValue('medium');
    
    // Change to hard
    await difficultySelect.selectOption('hard');
    await expect(difficultySelect).toHaveValue('hard');
    
    // Change to easy
    await difficultySelect.selectOption('easy');
    await expect(difficultySelect).toHaveValue('easy');
  });

  test('should show loading state during generation', async ({ page }) => {
    // Mock the API call to be slow
    await page.route('/api/algorithm/generate', async route => {
      // Delay the response
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            explanation: 'Test explanation',
            code: 'def test(): pass',
            language: 'python',
            visualizationPlan: {
              title: 'Test Algorithm',
              description: 'Test description',
              algorithmType: 'test',
              complexity: { time: 'O(1)', space: 'O(1)' },
              steps: [],
              initialState: {},
              finalState: {}
            }
          }
        })
      });
    });

    // Fill form and submit
    await page.fill('input[id="title"]', 'Test Problem');
    await page.fill('textarea[id="description"]', 'Test description');
    await page.fill('input[placeholder="e.g., [2,7,11,15], target = 9"]', 'test input');
    await page.fill('input[placeholder="e.g., [0,1]"]', 'test output');
    
    await page.click('button[type="submit"]');
    
    // Should show loading state
    await expect(page.locator('text=Generating Solution...')).toBeVisible();
    
    // Should eventually show solution
    await expect(page.locator('text=Test Algorithm')).toBeVisible({ timeout: 5000 });
  });
});