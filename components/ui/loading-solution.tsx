'use client';

import { useState, useEffect } from 'react';

interface LoadingSolutionProps {
  isVisible: boolean;
}

const LOADING_STEPS = [
  'Analyzing Problem Structure...',
  'Designing Optimal Algorithm...',
  'Generating Code Implementation...',
  'Creating Visualizations...',
  'Finalizing Solution...'
];

export default function LoadingSolution({ isVisible }: LoadingSolutionProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setDots('');
      return;
    }

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Change steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % LOADING_STEPS.length);
    }, 4000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(stepInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center"
      style={{ zIndex: 10000 }}
    >
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          {/* Spinning icon */}
          <div className="mb-6">
            <svg 
              className="animate-spin h-12 w-12 text-blue-600 mx-auto"
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Generating Solution
          </h2>
          
          <p className="text-lg text-blue-600 font-medium mb-6">
            {LOADING_STEPS[currentStep]}{dots}
          </p>

          <div className="space-y-2">
            {LOADING_STEPS.map((step, index) => (
              <div key={index} className="flex items-center text-sm">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  index <= currentStep ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <span className={`${
                  index <= currentStep ? 'text-green-700' : 'text-gray-500'
                }`}>
                  {step.replace('...', '')}
                </span>
                {index === currentStep && (
                  <span className="ml-1 text-blue-600">{dots}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}