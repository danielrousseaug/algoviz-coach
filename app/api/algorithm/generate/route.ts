import { NextRequest, NextResponse } from 'next/server';
import { generateAlgorithmSolution } from '@/lib/api/openai';
import { ProblemSchema } from '@/lib/schemas/visualization';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const problem = ProblemSchema.parse(body);
    
    const solution = await generateAlgorithmSolution(problem);
    
    return NextResponse.json({
      success: true,
      data: solution,
    });
  } catch (error) {
    console.error('Error in /api/algorithm/generate:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid problem format',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate algorithm solution',
      },
      { status: 500 }
    );
  }
}