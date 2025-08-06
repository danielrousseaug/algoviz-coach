import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/api/openai';
import { ProblemSchema, AlgorithmSolutionSchema, ChatMessageSchema } from '@/lib/schemas/visualization';
import { z } from 'zod';

const ChatRequestSchema = z.object({
  question: z.string().min(1),
  problem: ProblemSchema,
  solution: AlgorithmSolutionSchema,
  chatHistory: z.array(ChatMessageSchema).optional().default([]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { question, problem, solution, chatHistory } = ChatRequestSchema.parse(body);
    
    const response = await generateChatResponse(
      question,
      problem,
      solution,
      chatHistory.map(msg => ({ role: msg.role, content: msg.content }))
    );
    
    return NextResponse.json({
      success: true,
      data: {
        response,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request format',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate chat response',
      },
      { status: 500 }
    );
  }
}