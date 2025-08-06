'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import VisualizationRenderer from '../visualization/visualization-renderer';
import VisualizationControls from '../visualization/visualization-controls';

export default function SolutionDisplay() {
  const [activeTab, setActiveTab] = useState<'explanation' | 'code' | 'visualization'>('explanation');
  const { solution, currentVisualizationStep } = useAppStore();

  if (!solution) {
    return null;
  }

  const currentStep = solution.visualizationPlan.steps[currentVisualizationStep];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('explanation')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'explanation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Explanation
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'code'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Code Implementation
            </button>
            <button
              onClick={() => setActiveTab('visualization')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'visualization'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visualization
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'explanation' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {solution.visualizationPlan.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {solution.visualizationPlan.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Time Complexity</h4>
                  <code className="text-lg text-blue-600 font-mono">
                    {solution.visualizationPlan.complexity.time}
                  </code>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Space Complexity</h4>
                  <code className="text-lg text-blue-600 font-mono">
                    {solution.visualizationPlan.complexity.space}
                  </code>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Algorithm Explanation</h4>
                <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {solution.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-800">
                  {solution.language.charAt(0).toUpperCase() + solution.language.slice(1)} Implementation
                </h4>
                <button
                  onClick={() => navigator.clipboard.writeText(solution.code)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Copy Code
                </button>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-100">
                  <code>{solution.code}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'visualization' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">
                  Step {currentVisualizationStep + 1}: {currentStep?.description || 'No description available'}
                </h4>
                {currentStep ? (
                  <VisualizationRenderer 
                    step={currentStep} 
                    width={800} 
                    height={400}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                    <div className="text-gray-500">No visualization step available</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'visualization' && solution.visualizationPlan.steps.length > 0 && (
        <VisualizationControls />
      )}
    </div>
  );
}