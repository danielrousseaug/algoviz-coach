'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import VisualizationRenderer from '../visualization/visualization-renderer';
import ZoomPan from '../visualization/zoom-pan';
import VisualizationControls from '../visualization/visualization-controls';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function SolutionDisplay() {
  const [activeTab, setActiveTab] = useState<'explanation' | 'code' | 'visualization'>('explanation');
  const { solution, currentVisualizationStep } = useAppStore();
  const vizContainerRef = useRef<HTMLDivElement>(null);
  const [vizSize, setVizSize] = useState<{ width: number; height: number }>({ width: 800, height: 400 });

  useEffect(() => {
    const el = vizContainerRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      const width = Math.max(320, w - 16);
      const height = Math.max(280, Math.round(width * 0.5));
      setVizSize({ width, height });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!solution) {
    return null;
  }

  const currentStep = solution.visualizationPlan.steps[currentVisualizationStep];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="glass rounded-xl border card-shadow">
        <div className="border-b border-white/10">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('explanation')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'explanation'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-foreground hover:border-white/10'
              }`}
            >
              Explanation
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'code'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-foreground hover:border-white/10'
              }`}
            >
              Code Implementation
            </button>
            <button
              onClick={() => setActiveTab('visualization')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'visualization'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-foreground hover:border-white/10'
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
                <h3 className="text-xl font-bold mb-2">
                  {solution.visualizationPlan.title}
                </h3>
                <p className="text-muted mb-4">
                  {solution.visualizationPlan.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Time Complexity</h4>
                  <code className="text-lg text-accent font-mono">
                    {solution.visualizationPlan.complexity.time}
                  </code>
                </div>
                <div className="glass border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Space Complexity</h4>
                  <code className="text-lg text-accent font-mono">
                    {solution.visualizationPlan.complexity.space}
                  </code>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Algorithm Explanation</h4>
                <div className="max-w-none">
                  <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                    {solution.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">
                  {solution.language.charAt(0).toUpperCase() + solution.language.slice(1)} Implementation
                </h4>
                <button
                  onClick={() => navigator.clipboard.writeText(solution.code)}
                  className="px-3 py-1 text-sm glass border hover:bg-white/10 rounded-md transition-colors"
                >
                  Copy Code
                </button>
              </div>
              <div className="rounded-lg overflow-hidden">
                <SyntaxHighlighter
                  language={solution.language === 'cpp' ? 'cpp' : solution.language === 'csharp' ? 'csharp' : solution.language}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.5rem',
                    fontSize: '14px',
                  }}
                  showLineNumbers
                >
                  {solution.code}
                </SyntaxHighlighter>
              </div>
            </div>
          )}

          {activeTab === 'visualization' && (
            <div className="space-y-4">
              <div className="glass border-l-4 border-l-accent/50 border rounded-r-md p-4">
                <h4 className="font-medium text-sm">
                  Step {currentVisualizationStep + 1}
                </h4>
                <p className="text-muted mt-1">
                  {currentStep?.description || 'No description available'}
                </p>
              </div>
              <div ref={vizContainerRef} className="rounded-lg overflow-hidden">
                {currentStep ? (
                  <ZoomPan width={vizSize.width} height={vizSize.height}>
                    <VisualizationRenderer step={currentStep} width={vizSize.width} height={vizSize.height} />
                  </ZoomPan>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-muted">No visualization step available</div>
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