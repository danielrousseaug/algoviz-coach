'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { setApiKey, removeApiKey, setApiKeyValid, validateApiKeyFormat, maskApiKey, getApiKey } from '@/lib/utils/api-key';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [validationSuccess, setValidationSuccess] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  
  const { setHasValidApiKey } = useAppStore();

  useEffect(() => {
    if (isOpen) {
      // Load existing API key if any
      const existingKey = getApiKey();
      if (existingKey) {
        setApiKeyInput(existingKey);
      }
      setValidationError('');
      setValidationSuccess('');
    }
  }, [isOpen]);

  const handleValidateApiKey = async () => {
    if (!apiKeyInput.trim()) {
      setValidationError('Please enter your OpenAI API key');
      return;
    }

    if (!validateApiKeyFormat(apiKeyInput.trim())) {
      setValidationError('Invalid API key format. OpenAI API keys should start with "sk-" followed by alphanumeric characters.');
      return;
    }

    setIsValidating(true);
    setValidationError('');
    setValidationSuccess('');

    try {
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: apiKeyInput.trim() }),
      });

      const result = await response.json();

      if (result.success) {
        // Save the API key and mark as valid
        setApiKey(apiKeyInput.trim());
        setApiKeyValid(true);
        setHasValidApiKey(true);
        setValidationSuccess(result.message || 'API key validated successfully!');
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setValidationError(result.error || 'API key validation failed');
      }
    } catch {
      setValidationError('Network error during validation. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveApiKey = () => {
    removeApiKey();
    setHasValidApiKey(false);
    setApiKeyInput('');
    setValidationSuccess('');
    setValidationError('');
  };

  if (!isOpen) return null;

  const existingKey = getApiKey();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {existingKey ? 'Manage API Key' : 'Setup OpenAI API Key'}
          </h2>
          <p className="text-gray-600 text-sm">
            {existingKey 
              ? 'Update or remove your OpenAI API key' 
              : 'Enter your OpenAI API key to start generating algorithm solutions'
            }
          </p>
        </div>

        {existingKey && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800 font-medium">Current API Key</p>
                <p className="text-sm text-green-600">{maskApiKey(existingKey)}</p>
              </div>
              <button
                onClick={handleRemoveApiKey}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI API Key
            </label>
            <div className="relative">
              <input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 pr-10"
                disabled={isValidating}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showApiKey ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L18.16 18.16" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            <p>🔐 Your API key is stored securely in your browser cookies and never sent to our servers.</p>
            <p className="mt-1">
              Get your API key from: 
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 ml-1"
              >
                OpenAI Platform →
              </a>
            </p>
          </div>

          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {validationError}
            </div>
          )}

          {validationSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
              ✅ {validationSuccess}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isValidating}
            >
              {existingKey ? 'Close' : 'Cancel'}
            </button>
            <button
              onClick={handleValidateApiKey}
              disabled={isValidating || !apiKeyInput.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? 'Validating...' : 'Validate & Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}