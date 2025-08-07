import OpenAI from 'openai';
import { AlgorithmSolutionSchema, type AlgorithmSolution, type Problem } from '../schemas/visualization';

const ALGORITHM_GENERATION_PROMPT = (language: string) => `You are an expert algorithm educator and visualization designer. Given a programming problem, you must provide a comprehensive solution with detailed visualization instructions.

Your response must be valid JSON matching this exact structure:
{
  "explanation": "Step-by-step algorithmic explanation in plain English",
  "code": "${language} implementation with clear comments",
  "language": "${language}",
  "visualizationPlan": {
    "title": "Algorithm name",
    "description": "Brief description of what the algorithm does",
    "algorithmType": "Type of algorithm (sorting, searching, graph, etc.)",
    "complexity": {
      "time": "Big O time complexity",
      "space": "Big O space complexity"
    },
    "steps": [
      {
        "id": "step_1",
        "description": "What happens in this step",
        "type": "array|tree|graph|flow|chart|custom",
        "data": {
          "elements": [1, 2, 3, 4, 5]
        },
        "animations": [
          {
            "element": "Which element to animate",
            "property": "What property changes",
            "from": "Starting value",
            "to": "Ending value",
            "duration": 1000,
            "delay": 0
          }
        ],
        "highlights": ["elements to highlight"],
        "annotations": [
          {
            "text": "Explanation text",
            "position": {"x": 0, "y": 0},
            "style": {"color": "#000"}
          }
        ]
      }
    ],
    "initialState": {
      "description": "Starting state of data",
      "data": {}
    },
    "finalState": {
      "description": "End state of data", 
      "data": {}
    }
  }
}

For visualization types:
- "array": Use for array/list operations. Data format: {"elements": [1, 2, 3, 4, 5]}
- "tree": Use for tree structures. Data format: {"tree": {"id": "root", "value": 1, "left": {"id": "left", "value": 2}, "right": {"id": "right", "value": 3}}}
- "graph": Use for graph algorithms. Data format: {"nodes": [{"id": "A", "label": "A"}], "edges": [{"source": "A", "target": "B"}]}
- "flow": Use for flowcharts showing algorithm logic
- "chart": Use for displaying complexity analysis or comparisons
- "custom": Use for specialized visualizations

CRITICAL: Always provide actual data in the correct format for the visualization type. 

Example for Two Sum problem:
{
  "id": "step1",
  "description": "Initialize hash map and check first element",
  "type": "array",
  "data": {
    "elements": [2, 7, 11, 15]
  },
  "highlights": ["0"]
}

For arrays, use {"elements": [actual_array_data]}. For trees, use {"tree": tree_structure}. For graphs, use {"nodes": [...], "edges": [...]}.

IMPORTANT: 
- All JSON values must be properly typed (no strings where objects are expected)
- initialState and finalState must be objects with "description" (string) and "data" (object) properties
- The "data" property should contain the actual state data as key-value pairs
- Ensure all JSON is valid and matches the schema exactly

Make the visualization plan detailed enough that a frontend can render it dynamically. Include specific data structures, animation sequences, and visual elements.

Problem to solve:`;

const CHAT_RESPONSE_PROMPT = `You are an expert algorithm tutor. The user is asking a follow-up question about an algorithm solution. Provide a clear, educational response that helps them understand the concept better.

Context:
- Original Problem: {problem}
- Algorithm Solution: {solution}
- Previous Chat History: {chatHistory}

User Question: {question}

Provide a helpful, accurate response that addresses their specific question while maintaining the educational context.`;

export async function generateAlgorithmSolution(problem: Problem, language: string = 'python', apiKey: string): Promise<AlgorithmSolution> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const openai = new OpenAI({
    apiKey: apiKey,
  });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: ALGORITHM_GENERATION_PROMPT(language),
        },
        {
          role: 'user',
          content: `Problem Title: ${problem.title}

Problem Description: ${problem.description}

Examples:
${problem.examples.map((ex, i) => `Example ${i + 1}:
Input: ${ex.input}
Output: ${ex.output}
${ex.explanation ? `Explanation: ${ex.explanation}` : ''}`).join('\n\n')}

${problem.constraints ? `Constraints:\n${problem.constraints.join('\n')}` : ''}

Difficulty: ${problem.difficulty || 'medium'}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from OpenAI');
      }
    }

    // Transform string states to objects if needed
    if (parsedResponse.visualizationPlan) {
      if (typeof parsedResponse.visualizationPlan.initialState === 'string') {
        parsedResponse.visualizationPlan.initialState = {
          description: parsedResponse.visualizationPlan.initialState,
          data: {}
        };
      }
      if (typeof parsedResponse.visualizationPlan.finalState === 'string') {
        parsedResponse.visualizationPlan.finalState = {
          description: parsedResponse.visualizationPlan.finalState,
          data: {}
        };
      }
    }

    const validatedSolution = AlgorithmSolutionSchema.parse(parsedResponse);
    return validatedSolution;
  } catch (error) {
    console.error('Error generating algorithm solution:', error);
    throw new Error(`Failed to generate algorithm solution: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateChatResponse(
  question: string,
  problem: Problem,
  solution: AlgorithmSolution,
  chatHistory: Array<{ role: string; content: string }> = [],
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const openai = new OpenAI({
    apiKey: apiKey,
  });

  try {
    const formattedHistory = chatHistory.slice(-6).map(msg => `${msg.role}: ${msg.content}`).join('\n');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: CHAT_RESPONSE_PROMPT
            .replace('{problem}', JSON.stringify(problem))
            .replace('{solution}', JSON.stringify(solution))
            .replace('{chatHistory}', formattedHistory)
            .replace('{question}', question),
        },
        {
          role: 'user',
          content: question,
        },
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return content;
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error(`Failed to generate chat response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function testOpenAIConnection(): Promise<boolean> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5,
    });
    return !!response.choices[0]?.message?.content;
  } catch (error) {
    console.error('OpenAI connection test failed:', error);
    return false;
  }
}