'use client';

import { Suspense } from 'react';
import type { VisualizationStep } from '@/lib/schemas/visualization';
import ArrayVisualization from './array-visualization';
import TreeVisualization from './tree-visualization';
import GraphVisualization from './graph-visualization';
import FallbackVisualization from './fallback-visualization';

interface VisualizationRendererProps {
  step: VisualizationStep;
  width?: number;
  height?: number;
}

function VisualizationFallback() {
  return (
    <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
      <div className="text-gray-500">Loading visualization...</div>
    </div>
  );
}


export default function VisualizationRenderer({ step, width, height }: VisualizationRendererProps) {
  const renderVisualization = () => {
    try {
      // Check if step has proper data
      if (!step.data || Object.keys(step.data).length === 0) {
        return <FallbackVisualization step={step} width={width} height={height} />;
      }

      switch (step.type) {
        case 'array':
          // Check if array data is properly formatted
          if (!step.data.elements || !Array.isArray(step.data.elements)) {
            return <FallbackVisualization step={step} width={width} height={height} />;
          }
          return <ArrayVisualization step={step} width={width} height={height} />;
        case 'tree':
          return <TreeVisualization step={step} width={width} height={height} />;
        case 'graph':
          return <GraphVisualization step={step} width={width} height={height} />;
        case 'flow':
        case 'chart':
        case 'custom':
        default:
          return <FallbackVisualization step={step} width={width} height={height} />;
      }
    } catch (error) {
      console.error('Error rendering visualization:', error);
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-lg border border-red-200">
          <div className="text-red-600 mb-2">
            Error rendering visualization
          </div>
          <div className="text-sm text-red-400">
            {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </div>
      );
    }
  };

  return (
    <Suspense fallback={<VisualizationFallback />}>
      {renderVisualization()}
    </Suspense>
  );
}