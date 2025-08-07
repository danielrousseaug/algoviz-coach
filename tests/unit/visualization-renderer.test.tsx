import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import VisualizationRenderer from '@/components/visualization/visualization-renderer';
import type { VisualizationStep } from '@/lib/schemas/visualization';

describe('VisualizationRenderer', () => {
  it('should render array visualization', () => {
    const arrayStep: VisualizationStep = {
      id: 'step1',
      description: 'Array visualization test',
      type: 'array',
      data: {
        elements: [1, 2, 3, 4, 5]
      }
    };

    render(<VisualizationRenderer step={arrayStep} />);
    
    expect(screen.getByText('Array visualization test')).toBeInTheDocument();
  });

  it('should render tree visualization', () => {
    const treeStep: VisualizationStep = {
      id: 'step1',
      description: 'Tree visualization test',
      type: 'tree',
      data: {
        tree: {
          id: 'root',
          value: 1,
          left: { id: 'left', value: 2 },
          right: { id: 'right', value: 3 }
        }
      }
    };

    render(<VisualizationRenderer step={treeStep} />);
    
    expect(screen.getByText('Tree visualization test')).toBeInTheDocument();
  });

  it('should render unsupported visualization message', () => {
    const unsupportedStep: VisualizationStep = {
      id: 'step1',
      description: 'Unsupported visualization',
      type: 'custom',
      data: {}
    };

    render(<VisualizationRenderer step={unsupportedStep} />);
    
    expect(screen.getByText('Visualization type "custom" is not yet supported')).toBeInTheDocument();
  });

  it('should render with null data safely', () => {
    const nullDataStep: VisualizationStep = {
      id: 'step1',
      description: 'Null data test',
      type: 'array',
      data: {}
    };

    render(<VisualizationRenderer step={nullDataStep} />);
    
    expect(screen.getByText('Null data test')).toBeInTheDocument();
  });
});