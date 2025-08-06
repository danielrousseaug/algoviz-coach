'use client';

import { useMemo } from 'react';
import type { VisualizationStep } from '@/lib/schemas/visualization';

interface GraphNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  weight?: number;
}

interface GraphVisualizationProps {
  step: VisualizationStep;
  width?: number;
  height?: number;
}

export default function GraphVisualization({ step, width = 600, height = 400 }: GraphVisualizationProps) {
  const { nodes, edges, highlights = [], annotations = [] } = useMemo(() => {
    const data = step.data || {};
    return {
      nodes: (data.nodes as GraphNode[]) || [],
      edges: (data.edges as GraphEdge[]) || [],
      highlights: step.highlights || [],
      annotations: step.annotations || [],
    };
  }, [step]);

  const positionedNodes = useMemo(() => {
    if (nodes.length === 0) return [];
    
    const radius = Math.min(width, height) * 0.3;
    const centerX = width / 2;
    const centerY = height / 2;
    
    return nodes.map((node, index) => {
      if (node.x !== undefined && node.y !== undefined) {
        return node;
      }
      
      const angle = (2 * Math.PI * index) / nodes.length;
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  }, [nodes, width, height]);

  const getNodeById = (id: string) => positionedNodes.find(node => node.id === id);

  return (
    <div className="relative bg-gray-50 rounded-lg p-4">
      <svg width={width} height={height} className="mx-auto">
        {edges.map((edge, index) => {
          const sourceNode = getNodeById(edge.source);
          const targetNode = getNodeById(edge.target);
          
          if (!sourceNode || !targetNode || sourceNode.x === undefined || sourceNode.y === undefined ||
              targetNode.x === undefined || targetNode.y === undefined) {
            return null;
          }
          
          const isHighlighted = highlights.includes(`${edge.source}-${edge.target}`) ||
                               highlights.includes(edge.source) || highlights.includes(edge.target);
          
          return (
            <g key={`edge-${index}`}>
              <line
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={isHighlighted ? '#3B82F6' : '#6B7280'}
                strokeWidth={isHighlighted ? 3 : 2}
                markerEnd="url(#arrowhead)"
              />
              {edge.weight !== undefined && (
                <text
                  x={(sourceNode.x + targetNode.x) / 2}
                  y={(sourceNode.y + targetNode.y) / 2}
                  textAnchor="middle"
                  dy="-5"
                  className="text-xs font-medium text-gray-600 bg-white"
                >
                  {edge.weight}
                </text>
              )}
            </g>
          );
        })}
        
        {positionedNodes.map((node) => {
          if (node.x === undefined || node.y === undefined) return null;
          
          const isHighlighted = highlights.includes(node.id) || highlights.includes(node.label);
          
          return (
            <g key={`node-${node.id}`}>
              <circle
                cx={node.x}
                cy={node.y}
                r={25}
                fill={isHighlighted ? '#3B82F6' : '#FFFFFF'}
                stroke={isHighlighted ? '#1D4ED8' : '#D1D5DB'}
                strokeWidth={2}
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dy="0.35em"
                className={`text-sm font-medium ${isHighlighted ? 'text-white' : 'text-gray-800'}`}
              >
                {node.label}
              </text>
            </g>
          );
        })}
        
        {annotations.map((annotation, index) => (
          <text
            key={`annotation-${index}`}
            x={annotation.position.x}
            y={annotation.position.y}
            className="text-sm font-medium text-gray-700"
            style={annotation.style}
          >
            {annotation.text}
          </text>
        ))}
        
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#6B7280"
            />
          </marker>
        </defs>
      </svg>
    </div>
  );
}