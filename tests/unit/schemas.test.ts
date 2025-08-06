import { describe, it, expect } from '@jest/globals';
import { 
  ProblemSchema, 
  AlgorithmSolutionSchema, 
  VisualizationPlanSchema,
  ChatMessageSchema 
} from '@/lib/schemas/visualization';

describe('Schema Validation', () => {
  describe('ProblemSchema', () => {
    it('should validate a valid problem', () => {
      const validProblem = {
        title: 'Two Sum',
        description: 'Find two numbers that add up to target',
        examples: [
          {
            input: '[2,7,11,15], target = 9',
            output: '[0,1]',
            explanation: 'nums[0] + nums[1] = 2 + 7 = 9'
          }
        ],
        constraints: ['2 <= nums.length <= 10^4'],
        difficulty: 'medium' as const
      };

      const result = ProblemSchema.safeParse(validProblem);
      expect(result.success).toBe(true);
    });

    it('should reject problem without title', () => {
      const invalidProblem = {
        description: 'Find two numbers that add up to target',
        examples: []
      };

      const result = ProblemSchema.safeParse(invalidProblem);
      expect(result.success).toBe(false);
    });
  });

  describe('AlgorithmSolutionSchema', () => {
    it('should validate a valid algorithm solution', () => {
      const validSolution = {
        explanation: 'Use hash map for O(n) solution',
        code: 'def two_sum(nums, target): pass',
        language: 'python',
        visualizationPlan: {
          title: 'Two Sum Algorithm',
          description: 'Hash map approach',
          algorithmType: 'searching',
          complexity: {
            time: 'O(n)',
            space: 'O(n)'
          },
          steps: [
            {
              id: 'step1',
              description: 'Initialize hash map',
              type: 'array' as const,
              data: { elements: [] }
            }
          ],
          initialState: {},
          finalState: {}
        }
      };

      const result = AlgorithmSolutionSchema.safeParse(validSolution);
      expect(result.success).toBe(true);
    });
  });

  describe('ChatMessageSchema', () => {
    it('should validate a valid chat message', () => {
      const validMessage = {
        id: '123',
        role: 'user' as const,
        content: 'What is the time complexity?',
        timestamp: new Date()
      };

      const result = ChatMessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const invalidMessage = {
        id: '123',
        role: 'invalid',
        content: 'What is the time complexity?',
        timestamp: new Date()
      };

      const result = ChatMessageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
    });
  });
});