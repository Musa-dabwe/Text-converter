import React, { useState, useEffect } from 'react';
// import { AuthProvider } from './context/AuthContext'; // Removed AuthProvider
import { FileProvider } from './context/FileContext';
import OnboardingScreen from './components/OnboardingScreen';
import MyFilesScreen from './components/MyFilesScreen';
import ConvertTextScreen from './components/ConvertTextScreen';
import { AppScreen } from './types';

// Fix: Change function App(): JSX.Element to const App: React.FC
const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('onboarding');

  useEffect(() => {
    // Check if onboarding has been completed (e.g., via localStorage)
    const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted');
    if (hasCompletedOnboarding === 'true') {
      setCurrentScreen('my-files');
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setCurrentScreen('my-files');
  };

  const navigateTo = (screen: AppScreen) => {
    setCurrentScreen(screen);
  };

  return (
    <div className="relative mx-auto flex h-auto min-h-screen w-full max-w-md flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      {/* <AuthProvider> */} {/* Removed AuthProvider */}
        <FileProvider>
          {currentScreen === 'onboarding' && <OnboardingScreen onComplete={handleOnboardingComplete} />}
          {currentScreen === 'my-files' && <MyFilesScreen navigateTo={navigateTo} />}
          {currentScreen === 'convert-text' && <ConvertTextScreen navigateTo={navigateTo} />}
        </FileProvider>
      {/* </AuthProvider> */} {/* Removed AuthProvider */}
    </div>
  );
}

export default App;