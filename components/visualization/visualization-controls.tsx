'use client';

import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store/app-store';

export default function VisualizationControls() {
  const {
    solution,
    currentVisualizationStep,
    isVisualizationPlaying,
    visualizationSpeed,
    setCurrentVisualizationStep,
    setVisualizationPlaying,
    setVisualizationSpeed,
    nextVisualizationStep,
    resetVisualization,
  } = useAppStore();

  const totalSteps = solution?.visualizationPlan.steps.length || 0;

  const handlePlay = useCallback(() => {
    setVisualizationPlaying(!isVisualizationPlaying);
  }, [isVisualizationPlaying, setVisualizationPlaying]);

  const handleReset = useCallback(() => {
    resetVisualization();
  }, [resetVisualization]);

  const handleStepChange = useCallback((step: number) => {
    setCurrentVisualizationStep(step);
  }, [setCurrentVisualizationStep]);

  const handleSpeedChange = useCallback((speed: number) => {
    setVisualizationSpeed(speed);
  }, [setVisualizationSpeed]);

  useEffect(() => {
    if (!isVisualizationPlaying || totalSteps === 0) return;

    const interval = setInterval(() => {
      nextVisualizationStep();
    }, visualizationSpeed);

    return () => clearInterval(interval);
  }, [isVisualizationPlaying, visualizationSpeed, totalSteps, nextVisualizationStep]);

  if (!solution || totalSteps === 0) {
    return null;
  }

  return (
    <div className="glass rounded-xl border card-shadow p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Visualization Controls</h3>
        <div className="text-sm text-muted">
          Step {currentVisualizationStep + 1} of {totalSteps}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleStepChange(currentVisualizationStep - 1)}
          disabled={currentVisualizationStep === 0}
          className="p-2 rounded-md glass border hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous step"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={handlePlay}
          className="p-2 rounded-md bg-primary hover:brightness-110 text-white border border-white/10"
          title={isVisualizationPlaying ? "Pause" : "Play"}
        >
          {isVisualizationPlaying ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={() => handleStepChange(currentVisualizationStep + 1)}
          disabled={currentVisualizationStep >= totalSteps - 1}
          className="p-2 rounded-md glass border hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next step"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={handleReset}
          className="p-2 rounded-md glass border hover:bg-white/10"
          title="Reset to beginning"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="step-slider" className="text-sm font-medium">
            Step
          </label>
          <span className="text-sm text-muted">
            {solution.visualizationPlan.steps[currentVisualizationStep]?.description || 'No description'}
          </span>
        </div>
        <input
          id="step-slider"
          type="range"
          min={0}
          max={totalSteps - 1}
          value={currentVisualizationStep}
          onChange={(e) => handleStepChange(parseInt(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="speed-slider" className="text-sm font-medium">
            Animation Speed
          </label>
          <span className="text-sm text-muted">
            {visualizationSpeed}ms
          </span>
        </div>
        <input
          id="speed-slider"
          type="range"
          min={100}
          max={3000}
          step={100}
          value={visualizationSpeed}
          onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <button
          onClick={() => handleSpeedChange(500)}
          className="p-2 rounded glass border hover:bg-white/10 font-medium"
        >
          Fast (500ms)
        </button>
        <button
          onClick={() => handleSpeedChange(1000)}
          className="p-2 rounded glass border hover:bg-white/10 font-medium"
        >
          Normal (1s)
        </button>
        <button
          onClick={() => handleSpeedChange(2000)}
          className="p-2 rounded glass border hover:bg-white/10 font-medium"
        >
          Slow (2s)
        </button>
      </div>
    </div>
  );
}