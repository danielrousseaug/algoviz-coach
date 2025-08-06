import { z } from 'zod';

export const VisualizationStepSchema = z.object({
  id: z.string(),
  description: z.string(),
  type: z.enum(['array', 'tree', 'graph', 'flow', 'chart', 'custom']),
  data: z.record(z.any()),
  animations: z.array(z.object({
    element: z.string(),
    property: z.string(),
    from: z.any(),
    to: z.any(),
    duration: z.number().default(1000),
    delay: z.number().default(0),
  })).optional(),
  highlights: z.array(z.string()).optional(),
  annotations: z.array(z.object({
    text: z.string(),
    position: z.object({
      x: z.number(),
      y: z.number(),
    }),
    style: z.record(z.string()).optional(),
  })).optional(),
});

export const VisualizationPlanSchema = z.object({
  title: z.string(),
  description: z.string(),
  algorithmType: z.string(),
  complexity: z.object({
    time: z.string(),
    space: z.string(),
  }),
  steps: z.array(VisualizationStepSchema),
  initialState: z.union([
    z.record(z.any()),
    z.object({
      description: z.string(),
      data: z.record(z.any()),
    })
  ]),
  finalState: z.union([
    z.record(z.any()),
    z.object({
      description: z.string(),
      data: z.record(z.any()),
    })
  ]),
});

export const AlgorithmSolutionSchema = z.object({
  explanation: z.string(),
  code: z.string(),
  language: z.string().default('python'),
  visualizationPlan: VisualizationPlanSchema,
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.date(),
});

export const ProblemSchema = z.object({
  title: z.string(),
  description: z.string(),
  examples: z.array(z.object({
    input: z.string(),
    output: z.string(),
    explanation: z.string().optional(),
  })),
  constraints: z.array(z.string()).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export type VisualizationStep = z.infer<typeof VisualizationStepSchema>;
export type VisualizationPlan = z.infer<typeof VisualizationPlanSchema>;
export type AlgorithmSolution = z.infer<typeof AlgorithmSolutionSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type Problem = z.infer<typeof ProblemSchema>;