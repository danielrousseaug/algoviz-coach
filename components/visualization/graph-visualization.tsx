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
    
    const nodeRadius = 25;
    const padding = 30;
    
    // Define strict canvas bounds
    const minX = nodeRadius + padding;
    const maxX = width - nodeRadius - padding;
    const minY = nodeRadius + padding;
    const maxY = height - nodeRadius - padding;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const availableWidth = maxX - minX;
    const availableHeight = maxY - minY;
    
    return nodes.map((node, index) => {
      if (node.x !== undefined && node.y !== undefined) {
        // Clamp pre-positioned nodes
        return { 
          ...node, 
          x: Math.max(minX, Math.min(maxX, node.x)),
          y: Math.max(minY, Math.min(maxY, node.y))
        };
      }
      
      let x, y;
      
      if (nodes.length > 8) {
        // Tight grid layout that guarantees fit
        const cols = Math.ceil(Math.sqrt(nodes.length));
        const rows = Math.ceil(nodes.length / cols);
        const col = index % cols;
        const row = Math.floor(index / cols);
        
        // Calculate cell dimensions to fit exactly within bounds
        const cellWidth = availableWidth / cols;
        const cellHeight = availableHeight / rows;
        
        x = minX + col * cellWidth + cellWidth / 2;
        y = minY + row * cellHeight + cellHeight / 2;
      } else {
        // Circular layout with radius that fits
        const maxRadius = Math.min(availableWidth, availableHeight) / 2.5; // Extra margin for safety
        const radius = Math.max(30, maxRadius); // Minimum readable radius
        const angle = (2 * Math.PI * index) / nodes.length;
        
        x = centerX + radius * Math.cos(angle);
        y = centerY + radius * Math.sin(angle);
      }
      
      // Final safety clamp - this should not be needed but ensures no overflow
      x = Math.max(minX, Math.min(maxX, x));
      y = Math.max(minY, Math.min(maxY, y));
      
      return { ...node, x, y };
    });
  }, [nodes, width, height]);

  const getNodeById = (id: string) => positionedNodes.find(node => node.id === id);

  // Debug logging
  if (positionedNodes.length > 0) {
    const minX = Math.min(...positionedNodes.map(n => n.x!));
    const maxX = Math.max(...positionedNodes.map(n => n.x!));
    const minY = Math.min(...positionedNodes.map(n => n.y!));
    const maxY = Math.max(...positionedNodes.map(n => n.y!));
    console.log(`Graph bounds: width=${width}, height=${height}`);
    console.log(`Actual node positions: x=[${minX}-${maxX}], y=[${minY}-${maxY}]`);
  }

  return (
    <div className="relative bg-gray-50 rounded-lg p-6">
      <div className="flex justify-center">
        <svg 
          width={width} 
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="border border-gray-200 rounded bg-white"
          style={{ overflow: 'hidden' }}
        >
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
                <g>
                  <circle
                    cx={(sourceNode.x + targetNode.x) / 2}
                    cy={(sourceNode.y + targetNode.y) / 2}
                    r="12"
                    fill="white"
                    stroke="#D1D5DB"
                    strokeWidth="1"
                  />
                  <text
                    x={(sourceNode.x + targetNode.x) / 2}
                    y={(sourceNode.y + targetNode.y) / 2}
                    textAnchor="middle"
                    dy="0.35em"
                    className="text-xs font-medium text-gray-600"
                    fill="currentColor"
                  >
                    {edge.weight}
                  </text>
                </g>
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
                fill="currentColor"
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
            fill="currentColor"
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
    </div>
  );
}