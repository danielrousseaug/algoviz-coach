'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { generateAlgorithm } from '@/lib/utils/api';
import { importLeetCodeProblem, isValidLeetCodeUrl } from '@/lib/utils/leetcode';
import type { Problem } from '@/lib/schemas/visualization';

export default function ProblemInput() {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    examples: { input: string; output: string; explanation: string; }[];
    constraints: string[];
    difficulty: 'easy' | 'medium' | 'hard';
  }>({
    title: '',
    description: '',
    examples: [{ input: '', output: '', explanation: '' }],
    constraints: [''],
    difficulty: 'medium',
  });

  const [leetCodeUrl, setLeetCodeUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const { 
    setProblem, 
    setSolution, 
    setLoading, 
    setError, 
    isLoading, 
    error, 
    selectedLanguage, 
    setSelectedLanguage,
    hasValidApiKey,
    setApiKeyModalOpen 
  } = useAppStore();

  const handleLeetCodeImport = async () => {
    if (!leetCodeUrl.trim()) {
      setError('Please enter a LeetCode URL');
      return;
    }

    if (!isValidLeetCodeUrl(leetCodeUrl)) {
      setError('Please enter a valid LeetCode problem URL (e.g., https://leetcode.com/problems/two-sum/)');
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const problemData = await importLeetCodeProblem(leetCodeUrl);
      
      // Auto-fill the form with imported data
      setFormData({
        title: problemData.title,
        description: problemData.description,
        examples: problemData.examples.length > 0 ? problemData.examples : [{ input: '', output: '', explanation: '' }],
        constraints: problemData.constraints.length > 0 ? problemData.constraints : [''],
        difficulty: problemData.difficulty,
      });

      // Clear the URL input after successful import
      setLeetCodeUrl('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import LeetCode problem');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasValidApiKey) {
      setError('Please add your OpenAI API key to generate solutions');
      setApiKeyModalOpen(true);
      return;
    }
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }

    const problem: Problem = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      examples: formData.examples.filter(ex => ex.input.trim() && ex.output.trim()),
      constraints: formData.constraints.filter(c => c.trim()),
      difficulty: formData.difficulty,
    };

    if (problem.examples.length === 0) {
      setError('At least one example is required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const solution = await generateAlgorithm(problem, selectedLanguage);
      setProblem(problem);
      setSolution(solution);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to generate solution');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleChange = (index: number, field: keyof typeof formData.examples[0], value: string) => {
    const newExamples = [...formData.examples];
    newExamples[index] = { ...newExamples[index], [field]: value };
    setFormData({ ...formData, examples: newExamples });
  };

  const handleConstraintChange = (index: number, value: string) => {
    const newConstraints = [...formData.constraints];
    newConstraints[index] = value;
    setFormData({ ...formData, constraints: newConstraints });
  };

  const addExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, { input: '', output: '', explanation: '' }],
    });
  };

  const addConstraint = () => {
    setFormData({
      ...formData,
      constraints: [...formData.constraints, ''],
    });
  };

  const removeExample = (index: number) => {
    if (formData.examples.length > 1) {
      setFormData({
        ...formData,
        examples: formData.examples.filter((_, i) => i !== index),
      });
    }
  };

  const removeConstraint = (index: number) => {
    if (formData.constraints.length > 1) {
      setFormData({
        ...formData,
        constraints: formData.constraints.filter((_, i) => i !== index),
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Enter Your Algorithm Problem</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* LeetCode Import Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.857 2.133 8.063-.074l8.705-8.217a1.125 1.125 0 0 0 .038-1.616l-2.307-2.307a1.125 1.125 0 0 0-1.616-.038l-5.773 6.024c-.381.396-1.009.396-1.391 0l-2.307-2.307a1.125 1.125 0 0 1 0-1.616l8.217-8.705c.381-.396.381-1.009 0-1.391L14.875.437A1.374 1.374 0 0 0 13.483 0z"/>
            </svg>
            <h3 className="text-lg font-medium text-blue-800">Quick Import from LeetCode</h3>
          </div>
          <p className="text-blue-700 text-sm mb-4">
            Paste a LeetCode problem URL to automatically fill in the form fields
          </p>
          <div className="flex gap-3">
            <input
              type="url"
              value={leetCodeUrl}
              onChange={(e) => setLeetCodeUrl(e.target.value)}
              placeholder="https://leetcode.com/problems/two-sum/"
              className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              disabled={isImporting || isLoading}
            />
            <button
              type="button"
              onClick={handleLeetCodeImport}
              disabled={isImporting || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isImporting ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or enter problem details manually</span>
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Problem Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="e.g., Two Sum"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Problem Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="Describe the problem you want to solve..."
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => {
                const value = e.target.value as 'easy' | 'medium' | 'hard';
                setFormData({ ...formData, difficulty: value });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              disabled={isLoading}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Programming Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              disabled={isLoading}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Examples *
          </label>
          {formData.examples.map((example, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-700">Example {index + 1}</h4>
                {formData.examples.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExample(index)}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-800 mb-1">Input</label>
                  <input
                    type="text"
                    value={example.input}
                    onChange={(e) => handleExampleChange(index, 'input', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                    placeholder="e.g., [2,7,11,15], target = 9"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-800 mb-1">Output</label>
                  <input
                    type="text"
                    value={example.output}
                    onChange={(e) => handleExampleChange(index, 'output', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                    placeholder="e.g., [0,1]"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-800 mb-1">Explanation (optional)</label>
                <input
                  type="text"
                  value={example.explanation}
                  onChange={(e) => handleExampleChange(index, 'explanation', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                  placeholder="Explain why this output is correct..."
                  disabled={isLoading}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addExample}
            className="text-blue-500 hover:text-blue-700 text-sm disabled:opacity-50"
            disabled={isLoading}
          >
            + Add Example
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Constraints (optional)
          </label>
          {formData.constraints.map((constraint, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={constraint}
                onChange={(e) => handleConstraintChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                placeholder="e.g., 1 <= nums.length <= 10^4"
                disabled={isLoading}
              />
              {formData.constraints.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeConstraint(index)}
                  className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                  disabled={isLoading}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addConstraint}
            className="text-blue-500 hover:text-blue-700 text-sm disabled:opacity-50"
            disabled={isLoading}
          >
            + Add Constraint
          </button>
        </div>

        {!hasValidApiKey && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">API Key Required</h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>You need to add your OpenAI API key to generate algorithm solutions.</p>
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setApiKeyModalOpen(true)}
                    className="text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded-md font-medium"
                  >
                    Add API Key
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? 'Generating Solution...' : 'Generate Algorithm Solution'}
        </button>
      </form>
    </div>
  );
}