import { NextResponse } from 'next/server';
import { testOpenAIConnection } from '@/lib/api/openai';

export async function GET() {
  try {
    const openaiHealthy = await testOpenAIConnection();
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      services: {
        openai: openaiHealthy ? 'healthy' : 'unhealthy',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}