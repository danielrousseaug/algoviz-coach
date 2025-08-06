'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import ProblemInput from '@/components/ui/problem-input';
import SolutionDisplay from '@/components/ui/solution-display';
import ChatInterface from '@/components/chat/chat-interface';
import LoadingSolution from '@/components/ui/loading-solution';
import ApiKeyModal from '@/components/ui/api-key-modal';
import { maskApiKey, getApiKey } from '@/lib/utils/api-key';

export default function Home() {
  const { 
    problem, 
    solution, 
    error, 
    reset, 
    isLoading,
    hasValidApiKey,
    isApiKeyModalOpen,
    checkApiKey,
    setApiKeyModalOpen
  } = useAppStore();

  useEffect(() => {
    // Check API key status on app load
    checkApiKey();
  }, [checkApiKey]);

  return (
    <>
      <LoadingSolution isVisible={isLoading} />
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} 
        onClose={() => setApiKeyModalOpen(false)} 
      />
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
            <div className="flex items-center space-x-3">
              {/* API Key Status */}
              <div className="flex items-center space-x-2">
                {hasValidApiKey ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 hidden sm:inline">
                      {maskApiKey(getApiKey() || '')}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 hidden sm:inline">No API Key</span>
                  </div>
                )}
                <button
                  onClick={() => setApiKeyModalOpen(true)}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded-md transition-colors"
                  title="Manage API Key"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {(problem || solution) && (
                <button
                  onClick={reset}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
                >
                  New Problem
                </button>
              )}
            </div>
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
    </>
  );
}
