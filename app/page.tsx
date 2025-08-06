'use client';

import { useAppStore } from '@/lib/store/app-store';
import ProblemInput from '@/components/ui/problem-input';
import SolutionDisplay from '@/components/ui/solution-display';
import ChatInterface from '@/components/chat/chat-interface';

export default function Home() {
  const { problem, solution, error, reset } = useAppStore();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">AlgoViz Coach</h1>
              <p className="ml-4 text-gray-600 hidden sm:block">
                Interactive Algorithm Learning Platform
              </p>
            </div>
            {(problem || solution) && (
              <button
                onClick={reset}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                New Problem
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {!solution ? (
          <div className="space-y-8">
            <div className="text-center py-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Learn Algorithms Visually
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Enter any LeetCode-style problem and get step-by-step explanations with interactive visualizations. 
                Perfect for understanding complex algorithms and preparing for technical interviews.
              </p>
            </div>
            <ProblemInput />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <SolutionDisplay />
            </div>
            <div className="lg:col-span-1">
              <ChatInterface />
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 AlgoViz Coach. Built with Next.js, OpenAI, and ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
