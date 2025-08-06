'use client';

import React, { useMemo, useCallback } from 'react';
import type { VisualizationStep } from '@/lib/schemas/visualization';

interface TreeNode {
  id: string;
  value: unknown;
  left?: TreeNode | null;
  right?: TreeNode | null;
  x?: number;
  y?: number;
}

interface TreeVisualizationProps {
  step: VisualizationStep;
  width?: number;
  height?: number;
}

export default function TreeVisualization({ step, width = 600, height = 400 }: TreeVisualizationProps) {
  const { tree, highlights = [], annotations = [] } = useMemo(() => {
    const data = step.data || {};
    return {
      tree: (data.tree as TreeNode) || null,
      highlights: step.highlights || [],
      annotations: step.annotations || [],
    };
  }, [step]);

  const calculatePositions = useCallback((node: TreeNode | null, x: number, y: number, level: number): TreeNode | null => {
    if (!node) return null;
    
    const levelWidth = width / Math.pow(2, level + 1);
    
    return {
      ...node,
      x,
      y,
      left: node.left ? calculatePositions(node.left, x - levelWidth, y + 80, level + 1) : null,
      right: node.right ? calculatePositions(node.right, x + levelWidth, y + 80, level + 1) : null,
    };
  }, [width]);

  const positionedTree = useMemo(() => {
    return tree ? calculatePositions(tree, width / 2, 50, 0) : null;
  }, [tree, width, calculatePositions]);

  const renderConnections = (node: TreeNode | null): React.JSX.Element[] => {
    if (!node) return [];
    
    const connections: React.JSX.Element[] = [];
    
    if (node.left && node.x !== undefined && node.y !== undefined && node.left.x !== undefined && node.left.y !== undefined) {
      connections.push(
        <line
          key={`line-${node.id}-left`}
          x1={node.x}
          y1={node.y + 20}
          x2={node.left.x}
          y2={node.left.y - 20}
          stroke="#6B7280"
          strokeWidth={2}
        />
      );
      connections.push(...renderConnections(node.left));
    }
    
    if (node.right && node.x !== undefined && node.y !== undefined && node.right.x !== undefined && node.right.y !== undefined) {
      connections.push(
        <line
          key={`line-${node.id}-right`}
          x1={node.x}
          y1={node.y + 20}
          x2={node.right.x}
          y2={node.right.y - 20}
          stroke="#6B7280"
          strokeWidth={2}
        />
      );
      connections.push(...renderConnections(node.right));
    }
    
    return connections;
  };

  const renderNodes = (node: TreeNode | null): React.JSX.Element[] => {
    if (!node || node.x === undefined || node.y === undefined) return [];
    
    const isHighlighted = highlights.includes(node.id) || highlights.includes(String(node.value));
    const nodes: React.JSX.Element[] = [];
    
    nodes.push(
      <g key={`node-${node.id}`}>
        <circle
          cx={node.x}
          cy={node.y}
          r={20}
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
          {String(node.value)}
        </text>
      </g>
    );
    
    if (node.left) {
      nodes.push(...renderNodes(node.left));
    }
    
    if (node.right) {
      nodes.push(...renderNodes(node.right));
    }
    
    return nodes;
  };

  return (
    <div className="relative bg-gray-50 rounded-lg p-4">
      <svg width={width} height={height} className="mx-auto">
        {positionedTree && (
          <>
            {renderConnections(positionedTree)}
            {renderNodes(positionedTree)}
          </>
        )}
        
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
      </svg>
    </div>
  );
}