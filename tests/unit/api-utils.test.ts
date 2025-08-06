import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { generateAlgorithm, sendChatMessage } from '@/lib/utils/api';

// Mock fetch globally
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('API Utils', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('generateAlgorithm', () => {
    it('should successfully generate algorithm', async () => {
      const mockProblem = {
        title: 'Two Sum',
        description: 'Find two numbers that add up to target',
        examples: [
          {
            input: '[2,7,11,15], target = 9',
            output: '[0,1]'
          }
        ]
      };

      const mockResponse = {
        success: true,
        data: {
          explanation: 'Use hash map',
          code: 'def two_sum(): pass',
          language: 'python',
          visualizationPlan: {
            title: 'Two Sum',
            description: 'Hash map approach',
            algorithmType: 'searching',
            complexity: { time: 'O(n)', space: 'O(n)' },
            steps: [],
            initialState: {},
            finalState: {}
          }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await generateAlgorithm(mockProblem);
      
      expect(mockFetch).toHaveBeenCalledWith('/api/algorithm/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockProblem),
      });
      
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors', async () => {
      const mockProblem = {
        title: 'Two Sum',
        description: 'Find two numbers that add up to target',
        examples: [
          {
            input: '[2,7,11,15], target = 9',
            output: '[0,1]'
          }
        ]
      };

      const mockErrorResponse = {
        success: false,
        error: 'API Error'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockErrorResponse,
      } as Response);

      await expect(generateAlgorithm(mockProblem)).rejects.toThrow('API Error');
    });
  });

  describe('sendChatMessage', () => {
    it('should successfully send chat message', async () => {
      const mockResponse = {
        success: true,
        data: {
          response: 'The time complexity is O(n)',
          timestamp: new Date().toISOString()
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await sendChatMessage(
        'What is the time complexity?',
        { title: 'Test', description: 'Test', examples: [] },
        { 
          explanation: 'Test', 
          code: 'test', 
          language: 'python',
          visualizationPlan: {
            title: 'Test',
            description: 'Test',
            algorithmType: 'test',
            complexity: { time: 'O(1)', space: 'O(1)' },
            steps: [],
            initialState: {},
            finalState: {}
          }
        },
        []
      );

      expect(result).toBe('The time complexity is O(n)');
    });
  });
});