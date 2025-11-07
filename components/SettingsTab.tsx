import React, { useState, useEffect, useCallback } from 'react';

type ApiKeyStatus = 'checking' | 'missing' | 'available';

const SettingsTab: React.FC = () => {
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>('checking');
  const [message, setMessage] = useState<string | null>(null);

  const checkApiKey = useCallback(async () => {
    setMessage(null); // Clear messages when re-checking
    setApiKeyStatus('checking');
    if (process.env.API_KEY && process.env.API_KEY.length > 0) {
      setApiKeyStatus('available');
      setMessage('API Key is currently available and configured.');
    } else if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
      // Optimistically assume it will be available via injection
      setApiKeyStatus('available');
      setMessage('An API Key has been selected and should be available for AI features.');
    } else {
      setApiKeyStatus('missing');
      setMessage('No Google AI API Key detected. AI features will not function without one.');
    }
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleSelectApiKey = useCallback(async () => {
    if (window.aistudio) {
      setMessage('Opening API Key selection dialog...');
      try {
        await window.aistudio.openSelectKey();
        // Optimistically assume success due to race condition guidance
        setApiKeyStatus('available'); // Set to available directly
        setMessage('API Key selected successfully! It should now be available for AI features.');
      } catch (error) {
        console.error('Error opening API key selection:', error);
        setMessage('Failed to open API Key selection. Please try again.');
        setApiKeyStatus('missing'); // Revert if something went wrong
      }
    } else {
      setMessage('API Key selection not supported in this environment.');
    }
  }, []);

  return (
    <div className="flex flex-col flex-1 p-4 gap-6">
      <h2 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em]">API Key Management</h2>
      <div className="rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <span className="material-symbols-outlined text-2xl text-primary">key</span>
          <p className="text-text-light dark:text-text-dark text-base font-medium">Google AI API Key Status</p>
        </div>
        {apiKeyStatus === 'checking' && (
          <div className="flex items-center text-subtext-light dark:text-subtext-dark mb-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            Checking status...
          </div>
        )}
        {apiKeyStatus === 'available' && (
          <p className="text-green-600 dark:text-green-400 text-sm mb-3">
            Status: <span className="font-semibold">Available</span>
          </p>
        )}
        {apiKeyStatus === 'missing' && (
          <>
            <p className="text-red-600 dark:text-red-400 text-sm mb-3">
              Status: <span className="font-semibold">Missing</span>
            </p>
            <button
              onClick={handleSelectApiKey}
              className="flex w-full items-center justify-center gap-x-2 rounded-lg bg-primary px-6 py-3 text-base font-bold text-white shadow-lg transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark mb-3">
              <span className="material-symbols-outlined">key</span>
              Select API Key
            </button>
          </>
        )}
        {message && (
          <p className={`text-sm mt-2 ${apiKeyStatus === 'missing' ? 'text-red-500' : 'text-subtext-light dark:text-subtext-dark'}`}>
            {message}
          </p>
        )}
        <p className="text-xs text-subtext-light dark:text-subtext-dark mt-4">
          Learn more about API key management and billing:&nbsp;
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
            ai.google.dev/gemini-api/docs/billing
          </a>
        </p>
      </div>

      <h2 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em] mt-4">About Textify</h2>
      <div className="rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-4 shadow-sm">
        <p className="text-text-light dark:text-text-dark text-sm mb-2">
          Textify is a versatile application designed to simplify text and code conversions.
          Leveraging Google AI, it offers features like file format conversion and
          image-to-UI code generation, all within a responsive mobile-first interface.
        </p>
        <p className="text-subtext-light dark:text-subtext-dark text-xs">
          Version: 1.0.0
        </p>
      </div>
    </div>
  );
};

export default SettingsTab;