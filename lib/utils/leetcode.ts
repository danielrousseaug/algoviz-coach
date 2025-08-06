interface LeetCodeProblem {
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

interface ImportResponse {
  success: boolean;
  data?: LeetCodeProblem;
  error?: string;
}

export async function importLeetCodeProblem(url: string): Promise<LeetCodeProblem> {
  const response = await fetch('/api/leetcode/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  const result: ImportResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to import LeetCode problem');
  }

  return result.data;
}

export function isValidLeetCodeUrl(url: string): boolean {
  try {
    const regex = /https?:\/\/leetcode\.com\/problems\/[^\/\?]+/;
    return regex.test(url);
  } catch {
    return false;
  }
}

export function getLanguageCodeSnippet(codeSnippets: LeetCodeProblem['codeSnippets'], language: string): string {
  const languageMap: Record<string, string[]> = {
    python: ['python', 'python3'],
    javascript: ['javascript'],
    java: ['java'],
    cpp: ['cpp', 'c++'],
    csharp: ['csharp', 'c#'],
    go: ['go', 'golang'],
    rust: ['rust']
  };

  const targetLangs = languageMap[language.toLowerCase()] || [language.toLowerCase()];
  
  for (const targetLang of targetLangs) {
    const snippet = codeSnippets.find(s => 
      s.lang.toLowerCase() === targetLang || 
      s.lang.toLowerCase().includes(targetLang)
    );
    if (snippet) {
      return snippet.code;
    }
  }

  return '';
}