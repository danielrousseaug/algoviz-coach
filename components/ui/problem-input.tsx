'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { generateAlgorithm } from '@/lib/utils/api';
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

  const { setProblem, setSolution, setLoading, setError, isLoading, error } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    try {
      setLoading(true);
      setError(null);
      setProblem(problem);
      
      const solution = await generateAlgorithm(problem);
      setSolution(solution);
    } catch (err) {
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
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Problem Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the problem you want to solve..."
            disabled={isLoading}
          />
        </div>

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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
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
                  <label className="block text-xs font-medium text-gray-600 mb-1">Input</label>
                  <input
                    type="text"
                    value={example.input}
                    onChange={(e) => handleExampleChange(index, 'input', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="e.g., [2,7,11,15], target = 9"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Output</label>
                  <input
                    type="text"
                    value={example.output}
                    onChange={(e) => handleExampleChange(index, 'output', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="e.g., [0,1]"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Explanation (optional)</label>
                <input
                  type="text"
                  value={example.explanation}
                  onChange={(e) => handleExampleChange(index, 'explanation', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
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