'use client';

import { useMemo } from 'react';
import type { VisualizationStep } from '@/lib/schemas/visualization';

interface ArrayVisualizationProps {
  step: VisualizationStep;
  width?: number;
  height?: number;
}

export default function ArrayVisualization({ step, width = 600, height = 200 }: ArrayVisualizationProps) {
  const { elements, highlights = [], annotations = [] } = useMemo(() => {
    const data = step.data || {};
    
    // Debug logging
    console.log('ArrayVisualization received data:', data);
    console.log('Elements:', data.elements);
    
    return {
      elements: Array.isArray(data.elements) ? data.elements : [],
      highlights: step.highlights || [],
      annotations: step.annotations || [],
    };
  }, [step]);

  const elementWidth = Math.min(60, (width - 40) / Math.max(elements.length, 1));
  const elementHeight = 40;
  const startX = (width - (elements.length * elementWidth)) / 2;
  const elementY = (height - elementHeight) / 2;

  // If no elements, show debug info
  if (elements.length === 0) {
    return (
      <div className="relative bg-gray-50 rounded-lg p-4">
        <div className="flex flex-col items-center justify-center h-32">
          <p className="text-gray-500 mb-2">No array elements to display</p>
          <p className="text-xs text-gray-400">Data received: {JSON.stringify(step.data, null, 2)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-50 rounded-lg p-4">
      <svg width={width} height={height} className="mx-auto">
        {elements.map((element: unknown, index: number) => {
          const x = startX + index * elementWidth;
          const isHighlighted = highlights.includes(index.toString()) || highlights.includes(String(element));
          
          return (
            <g key={index}>
              <rect
                x={x}
                y={elementY}
                width={elementWidth - 2}
                height={elementHeight}
                fill={isHighlighted ? '#3B82F6' : '#FFFFFF'}
                stroke={isHighlighted ? '#1D4ED8' : '#D1D5DB'}
                strokeWidth={2}
                rx={4}
              />
              <text
                x={x + elementWidth / 2}
                y={elementY + elementHeight / 2}
                textAnchor="middle"
                dy="0.35em"
                className={`text-sm font-medium ${isHighlighted ? 'text-white' : 'text-gray-800'}`}
              >
                {String(element)}
              </text>
              <text
                x={x + elementWidth / 2}
                y={elementY + elementHeight + 15}
                textAnchor="middle"
                className="text-xs text-gray-500"
              >
                {index}
              </text>
            </g>
          );
        })}
        
        {annotations.map((annotation, index) => (
          <g key={`annotation-${index}`}>
            <text
              x={annotation.position.x}
              y={annotation.position.y}
              className="text-sm font-medium text-gray-700"
              style={annotation.style}
            >
              {annotation.text}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}