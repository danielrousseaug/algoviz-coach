'use client';

import React, { useEffect } from 'react';
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
    setApiKeyModalOpen,
  } = useAppStore();

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  return (
    <div className="min-h-screen relative">
      <LoadingSolution isVisible={isLoading} />
      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setApiKeyModalOpen(false)} />

      <header className="sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-4 mb-4 glass card-shadow rounded-xl border">
            <div className="flex items-center justify-between px-4 sm:px-6 h-16">
              <div className="flex items-center">
                <div className="relative mr-3">
                  <div className="absolute inset-0 bg-accent/30 blur-xl rounded-full -z-10" />
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent ring-1 ring-white/20 flex items-center justify-center">
                    <svg className="h-5 w-5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h8m-4-4l4 4-4 4" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">AlgoViz Coach</h1>
                  <p className="text-xs sm:text-sm text-muted hidden sm:block">Interactive Algorithm Learning</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 text-sm">
                  {hasValidApiKey ? (
                    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-400/20">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                      <span className="hidden sm:inline">{maskApiKey(getApiKey() || '')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-400/20">
                      <div className="w-2 h-2 bg-rose-400 rounded-full" />
                      <span className="hidden sm:inline">No API Key</span>
                    </div>
                  )}
                  <button
                    onClick={() => setApiKeyModalOpen(true)}
                    className="p-2 rounded-md hover:bg-white/10 border border-white/10 transition-colors"
                    title="Manage API Key"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                {(problem || solution) && (
                  <button
                    onClick={reset}
                    className="px-3 sm:px-4 py-2 text-sm bg-primary hover:brightness-110 text-white rounded-md transition-colors font-medium border border-white/10"
                  >
                    New Problem
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && (
          <div className="mb-6 p-4 glass rounded-lg border text-rose-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-rose-300" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-rose-200">Error</h3>
                <div className="mt-2 text-sm text-rose-200/90">{error}</div>
              </div>
            </div>
          </div>
        )}

        {!solution ? (
          <div className="space-y-8">
            <div className="text-center py-10">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full px-3 py-1 glass border text-xs text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                Smarter learning through visualization
              </div>
              <h2 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight">
                Learn Algorithms
                <span className="ml-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Visually</span>
              </h2>
              <p className="mt-4 text-base sm:text-lg text-muted max-w-2xl mx-auto">
                Paste a LeetCode problem or describe your own. Get step-by-step explanations, runnable code, and interactive visualizations.
              </p>
            </div>
            <ProblemInput />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <SolutionDisplay />
            </div>
            <div className="lg:col-span-1">
              <ChatInterface />
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-xl border card-shadow px-4 py-6 text-center text-muted">
            <p className="text-sm">© 2024 AlgoViz Coach · Built with Next.js and OpenAI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
