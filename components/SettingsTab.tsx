import React, { useState, useEffect, useCallback } from 'react';

type ApiKeyStatus = 'checking' | 'missing' | 'available';

const SettingsTab: React.FC = () => {
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>('checking');
  const [message, setMessage] = useState<string | null>(null);

  // Fix: Replace `import.meta.env.VITE_API_KEY` with `process.env.API_KEY` as per coding guidelines.
  const checkApiKey = useCallback(async () => {
    setMessage(null); // Clear messages when re-checking
    setApiKeyStatus('checking');

    const isAistudioEnvironment = typeof window.aistudio !== 'undefined' && typeof window.aistudio.hasSelectedApiKey === 'function';
    let keyIsConfigured = false;

    // Check client-side exposed env var first (e.g., VITE_API_KEY for Vite-like bundlers)
    // Use process.env for API key, as mandated by coding guidelines.
    if (process.env.API_KEY && process.env.API_KEY.length > 0) {
      keyIsConfigured = true;
    } 
    // Then check window.aistudio for AI Studio environment
    else if (isAistudioEnvironment) {
      try {
        keyIsConfigured = await window.aistudio.hasSelectedApiKey();
      } catch (error) {
        console.error("Error checking aistudio API key:", error);
        keyIsConfigured = false; // Assume not available if there's an error
      }
    }

    if (keyIsConfigured) {
      setApiKeyStatus('available');
      setMessage('API Key is configured and available.');
    } else {
      setApiKeyStatus('missing');
      if (isAistudioEnvironment) {
        setMessage('No Google AI API Key detected. Please select one to enable AI features.');
      } else {
        // Fix: Update message to refer to `API_KEY` instead of `VITE_API_KEY`.
        setMessage('No Google AI API Key detected. For this environment, configure your API Key as an environment variable (`API_KEY`) in your deployment platform (e.g., Netlify, Vercel) settings.');
      }
    }
  }, []); // No dependencies for checkApiKey itself, it should be stable

  useEffect(() => {
    checkApiKey();
  }, []); // Run on mount

  const handleSelectApiKey = useCallback(async () => {
    if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.openSelectKey === 'function') {
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
      setMessage('API Key selection is not supported in this environment (window.aistudio is unavailable).');
    }
  }, []);

  const isAistudioEnv = typeof window.aistudio !== 'undefined' && typeof window.aistudio.openSelectKey === 'function';

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
            {isAistudioEnv && ( // Only show button if in AI Studio environment
              <button
                onClick={handleSelectApiKey}
                className="flex w-full items-center justify-center gap-x-2 rounded-lg bg-primary px-6 py-3 text-base font-bold text-white shadow-lg transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark mb-3">
                <span className="material-symbols-outlined">key</span>
                Select API Key
              </button>
            )}
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