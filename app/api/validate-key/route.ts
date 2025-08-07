import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'API key is required'
      }, { status: 400 });
    }

    // Validate API key format first
    if (!apiKey.startsWith('sk-') || apiKey.length < 40) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key format. OpenAI API keys should start with "sk-" and be at least 40 characters long.'
      }, { status: 400 });
    }

    // Test the API key by making a simple request
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    try {
      // Make a minimal API call to test the key
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Use the cheapest model for validation
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      });

      if (response.choices && response.choices.length > 0) {
        return NextResponse.json({
          success: true,
          message: 'API key is valid and working!'
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'API key validation failed: No response from OpenAI'
        }, { status: 400 });
      }
    } catch (openaiError: unknown) {
      let errorMessage = 'API key validation failed';
      
      if (openaiError && typeof openaiError === 'object' && 'status' in openaiError) {
        const status = (openaiError as { status: number }).status;
        if (status === 401) {
          errorMessage = 'Invalid API key. Please check that your OpenAI API key is correct.';
        } else if (status === 429) {
          errorMessage = 'Rate limit exceeded. Your API key is valid but you may have reached your usage limit.';
        } else if (status === 403) {
          errorMessage = 'API key does not have access to the required models. Please check your OpenAI plan.';
        }
        if ('message' in openaiError && typeof openaiError.message === 'string') {
          errorMessage = `OpenAI API error: ${openaiError.message}`;
        }
      }

      return NextResponse.json({
        success: false,
        error: errorMessage,
        details: openaiError && typeof openaiError === 'object' && 'status' in openaiError ? `Status: ${(openaiError as { status: number }).status}` : undefined
      }, { status: 400 });
    }
  } catch (error) {
    console.error('API key validation error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Server error during API key validation'
    }, { status: 500 });
  }
}