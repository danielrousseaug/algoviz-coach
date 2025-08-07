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

  const padding = 40;
  const elementWidth = Math.min(60, (width - padding * 2) / Math.max(elements.length, 1));
  const elementHeight = 40;
  const totalWidth = elements.length * elementWidth;
  const startX = (width - totalWidth) / 2;
  const elementY = (height - elementHeight) / 2;

  // If no elements, show debug info
  if (elements.length === 0) {
    return (
      <div className="relative p-4">
        <div className="flex flex-col items-center justify-center h-32">
          <p className="mb-2 text-muted">No array elements to display</p>
          <p className="text-xs text-muted">Data received: {JSON.stringify(step.data, null, 2)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-6">
      <div className="flex justify-center">
        <svg 
          width={width} 
          height={height} 
          viewBox={`0 0 ${width} ${height}`}
          className="rounded text-foreground"
        >
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
                fill={isHighlighted ? 'url(#nodeHighlightArray)' : '#FFFFFF'}
                stroke={isHighlighted ? '#1D4ED8' : '#D1D5DB'}
                strokeWidth={2}
                rx={4}
              />
              <text
                x={x + elementWidth / 2}
                y={elementY + elementHeight / 2}
                textAnchor="middle"
                dy="0.35em"
                className={`text-sm font-medium ${isHighlighted ? 'text-white' : 'text-foreground'}`}
                fill="currentColor"
              >
                {String(element)}
              </text>
              <text
                x={x + elementWidth / 2}
                y={elementY + elementHeight + 18}
                textAnchor="middle"
                className="text-xs text-muted"
                fill="currentColor"
              >
                {index}
              </text>
            </g>
          );
        })}
        
        {/* annotations intentionally omitted to avoid duplicate description text inside the canvas */}
        <defs>
          <linearGradient id="nodeHighlightArray" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        </svg>
      </div>
    </div>
  );
}