'use client';

import type { VisualizationStep } from '@/lib/schemas/visualization';

interface FallbackVisualizationProps {
  step: VisualizationStep;
  width?: number;
  height?: number;
}

export default function FallbackVisualization({ step, height = 300 }: FallbackVisualizationProps) {
  return (
    <div className="relative bg-gray-50 rounded-lg p-4">
      <div className="flex flex-col items-center justify-center" style={{ height: height - 32 }}>
        <div className="text-center max-w-md">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-700 mb-4">Visualization Preview</h3>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-left">
            <h4 className="font-medium text-gray-700 mb-2">Step Data:</h4>
            <pre className="text-xs text-gray-600 overflow-auto max-h-32">
              {JSON.stringify(step.data, null, 2)}
            </pre>
          </div>
          
          <div className="mt-4">
            <p className="text-xs text-gray-500">
              This visualization type ({step.type}) needs proper data formatting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}