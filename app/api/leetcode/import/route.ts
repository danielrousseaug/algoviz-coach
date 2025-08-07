import { NextRequest, NextResponse } from 'next/server';
import { convert } from 'html-to-text';

interface LeetCodeResponse {
  data: {
    question: {
      questionId: string;
      title: string;
      content: string;
      difficulty: string;
      exampleTestcases: string;
      sampleTestCase: string;
      codeSnippets: {
        lang: string;
        code: string;
      }[];
    } | null;
  };
  errors?: unknown[];
}

interface ParsedProblem {
  title: string;
  description: string;
  examples: {
    input: string;
    output: string;
    explanation: string;
  }[];
  difficulty: 'easy' | 'medium' | 'hard';
  constraints: string[];
  codeSnippets: {
    lang: string;
    code: string;
  }[];
}

function extractSlugFromUrl(url: string): string | null {
  try {
    const regex = /leetcode\.com\/problems\/([^\/\?]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function parseExamples(content: string, exampleTestcases?: string): ParsedProblem['examples'] {
  const examples: ParsedProblem['examples'] = [];
  
  // Try to extract examples from content
  const exampleRegex = /<strong>Example \d+:<\/strong>\s*(.*?)(?=<strong>Example \d+:|<strong>Constraints:|$)/gsu;
  const matches = content.match(exampleRegex);
  
  if (matches) {
    matches.forEach((match) => {
      const inputMatch = match.match(/<strong>Input:<\/strong>\s*(.*?)(?=<br|<strong>)/su);
      const outputMatch = match.match(/<strong>Output:<\/strong>\s*(.*?)(?=<br|<strong>)/su);
      const explanationMatch = match.match(/<strong>Explanation:<\/strong>\s*(.*?)(?=<br|<strong>|$)/su);
      
      if (inputMatch && outputMatch) {
        examples.push({
          input: convert(inputMatch[1].trim(), { wordwrap: false }),
          output: convert(outputMatch[1].trim(), { wordwrap: false }),
          explanation: explanationMatch ? convert(explanationMatch[1].trim(), { wordwrap: false }) : ''
        });
      }
    });
  }
  
  // If no examples found in content, try to parse from exampleTestcases
  if (examples.length === 0 && exampleTestcases) {
    const testcases = exampleTestcases.split('\n').filter(line => line.trim());
    for (let i = 0; i < testcases.length; i += 2) {
      if (testcases[i + 1]) {
        examples.push({
          input: testcases[i],
          output: testcases[i + 1],
          explanation: ''
        });
      }
    }
  }
  
  return examples;
}

function parseConstraints(content: string): string[] {
  const constraints: string[] = [];
  
  const constraintsMatch = content.match(/<strong>Constraints:<\/strong>\s*(.*?)(?=<\/div>|$)/su);
  if (constraintsMatch) {
    const constraintsText = convert(constraintsMatch[1], { wordwrap: false });
    const constraintLines = constraintsText.split('\n').filter((line: string) => line.trim());
    constraints.push(...constraintLines);
  }
  
  return constraints;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }
    
    const titleSlug = extractSlugFromUrl(url);
    if (!titleSlug) {
      return NextResponse.json({
        success: false,
        error: 'Invalid LeetCode URL format'
      }, { status: 400 });
    }
    
    const query = `
      query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionId
          title
          content
          difficulty
          exampleTestcases
          sampleTestCase
          codeSnippets {
            lang
            code
          }
        }
      }
    `;
    
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        query,
        variables: { titleSlug }
      })
    });
    
    if (!response.ok) {
      throw new Error(`LeetCode API request failed: ${response.status}`);
    }
    
    const data: LeetCodeResponse = await response.json();
    
    if (data.errors || !data.data?.question) {
      return NextResponse.json({
        success: false,
        error: 'Problem not found or access denied'
      }, { status: 404 });
    }
    
    const question = data.data.question;
    
    // Parse and clean the content
    const cleanDescription = convert(question.content, {
      wordwrap: false,
      selectors: [
        { selector: 'img', format: 'skip' },
        { selector: 'a', options: { ignoreHref: true } }
      ]
    });
    
    const examples = parseExamples(question.content, question.exampleTestcases || question.sampleTestCase);
    const constraints = parseConstraints(question.content);
    
    const parsedProblem: ParsedProblem = {
      title: question.title,
      description: cleanDescription,
      examples: examples.length > 0 ? examples : [{
        input: '',
        output: '',
        explanation: ''
      }],
      difficulty: question.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
      constraints: constraints.length > 0 ? constraints : [''],
      codeSnippets: question.codeSnippets || []
    };
    
    return NextResponse.json({
      success: true,
      data: parsedProblem
    });
    
  } catch (error) {
    console.error('LeetCode import error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import LeetCode problem'
    }, { status: 500 });
  }
}