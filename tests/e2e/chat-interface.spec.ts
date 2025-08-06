import { test, expect } from '@playwright/test';

test.describe('Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Mock the API response for algorithm generation
    await page.route('/api/algorithm/generate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            explanation: 'This algorithm uses a hash map to solve the Two Sum problem in O(n) time.',
            code: 'def two_sum(nums, target):\n    num_to_index = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in num_to_index:\n            return [num_to_index[complement], i]\n        num_to_index[num] = i\n    return []',
            language: 'python',
            visualizationPlan: {
              title: 'Two Sum Algorithm',
              description: 'Hash map approach for finding two numbers that sum to target',
              algorithmType: 'searching',
              complexity: { time: 'O(n)', space: 'O(n)' },
              steps: [
                {
                  id: 'step1',
                  description: 'Initialize empty hash map',
                  type: 'array',
                  data: { elements: [2, 7, 11, 15] }
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

  test('should show chat interface after solution is generated', async ({ page }) => {
    await expect(page.locator('h3:has-text("Algorithm Q&A")')).toBeVisible();
    await expect(page.locator('input[placeholder*="Ask a question"]')).toBeVisible();
    await expect(page.locator('text=Ask me anything about this algorithm!')).toBeVisible();
  });

  test('should send and receive chat messages', async ({ page }) => {
    // Mock chat API response
    await page.route('/api/chat', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            response: 'The time complexity is O(n) because we iterate through the array once, and hash map operations (insert and lookup) are O(1) on average.',
            timestamp: new Date().toISOString()
          }
        })
      });
    });

    const chatInput = page.locator('input[placeholder*="Ask a question"]');
    const sendButton = page.locator('button[type="submit"]');

    // Type a question
    await chatInput.fill('What is the time complexity of this algorithm?');
    await sendButton.click();

    // Should show user message
    await expect(page.locator('text=What is the time complexity of this algorithm?')).toBeVisible();

    // Should show loading state
    await expect(page.locator('text=Thinking...')).toBeVisible();

    // Should show assistant response
    await expect(page.locator('text=The time complexity is O(n)')).toBeVisible();

    // Input should be cleared
    await expect(chatInput).toHaveValue('');
  });

  test('should clear chat history', async ({ page }) => {
    // Add a message first
    const chatInput = page.locator('input[placeholder*="Ask a question"]');
    await chatInput.fill('Test message');
    await page.click('button[type="submit"]');

    // Wait for message to appear
    await expect(page.locator('text=Test message')).toBeVisible();

    // Clear chat
    await page.click('text=Clear Chat');

    // Should show empty state again
    await expect(page.locator('text=Ask me anything about this algorithm!')).toBeVisible();
    await expect(page.locator('text=Test message')).not.toBeVisible();
  });

  test('should disable send button when input is empty', async ({ page }) => {
    const sendButton = page.locator('button[type="submit"]');
    
    // Should be disabled initially
    await expect(sendButton).toBeDisabled();

    // Should be enabled when there's text
    await page.fill('input[placeholder*="Ask a question"]', 'Test question');
    await expect(sendButton).not.toBeDisabled();

    // Should be disabled again when cleared
    await page.fill('input[placeholder*="Ask a question"]', '');
    await expect(sendButton).toBeDisabled();
  });

  test('should handle chat API errors gracefully', async ({ page }) => {
    // Mock error response
    await page.route('/api/chat', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Internal server error'
        })
      });
    });

    const chatInput = page.locator('input[placeholder*="Ask a question"]');
    await chatInput.fill('Test question');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Sorry, I encountered an error')).toBeVisible();
  });

  test('should show timestamps for messages', async ({ page }) => {
    await page.route('/api/chat', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            response: 'Test response',
            timestamp: new Date().toISOString()
          }
        })
      });
    });

    const chatInput = page.locator('input[placeholder*="Ask a question"]');
    await chatInput.fill('Test question');
    await page.click('button[type="submit"]');

    // Should show timestamps (time format like "10:30 AM")
    await expect(page.locator('text=/\\d{1,2}:\\d{2}.*[AP]M/').first()).toBeVisible();
  });
});