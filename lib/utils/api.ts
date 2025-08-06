import type { Problem, AlgorithmSolution, ChatMessage } from '../schemas/visualization';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export async function generateAlgorithm(problem: Problem): Promise<AlgorithmSolution> {
  const response = await fetch('/api/algorithm/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(problem),
  });

  const result: ApiResponse<AlgorithmSolution> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to generate algorithm');
  }

  return result.data;
}

export async function sendChatMessage(
  question: string,
  problem: Problem,
  solution: AlgorithmSolution,
  chatHistory: ChatMessage[]
): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question,
      problem,
      solution,
      chatHistory,
    }),
  });

  const result: ApiResponse<{ response: string; timestamp: string }> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to get chat response');
  }

  return result.data.response;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/health');
    const result = await response.json();
    return result.success && result.status === 'healthy';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}