import React from 'react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display text-white group/design-root overflow-x-hidden">
      {/* Top App Bar */}
      <div className="flex items-center bg-transparent p-4 justify-between">
        <div className="w-12"></div> {/* Spacer */}
        <div className="flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-primary">
            text_fields
          </span>
        </div>
        <div className="flex w-12 items-center justify-end">
          <button onClick={onComplete} className="text-slate-400 dark:text-[#90a4cb] text-base font-bold leading-normal tracking-[0.015em] shrink-0">Skip</button>
        </div>
      </div>
      <div className="flex flex-col flex-grow justify-between">
        <div className="flex-grow flex flex-col items-center justify-center pt-8">
          {/* Image/Illustration */}
          <div className="px-4 w-full max-w-sm">
            <div className="w-full gap-1 overflow-hidden bg-transparent aspect-square flex items-center justify-center">
              <div className="w-48 h-48 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-8xl text-primary">
                  docs_add_on
                </span>
              </div>
            </div>
          </div>
          {/* Headline Text */}
          <h1 className="text-slate-900 dark:text-white tracking-tight text-[32px] font-bold leading-tight px-4 text-center pb-3 pt-6">Welcome to Textify</h1>
          {/* Body Text */}
          <p className="text-slate-600 dark:text-slate-300 text-base font-normal leading-normal pb-3 pt-1 px-4 text-center max-w-md">Making your file conversions simple, fast, and effortless, right from your phone.</p>
        </div>
        <div className="w-full p-4 pb-8 space-y-5">
          {/* Page Indicators - Removed as requested */}
          {/* <div className="flex w-full flex-row items-center justify-center gap-3 py-5">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-[#314368]"></div>
            <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-[#314368]"></div>
          </div> */}
          {/* CTA Button */}
          <button
            onClick={onComplete}
            className="flex h-12 w-full items-center justify-center gap-x-2 rounded-lg bg-primary px-6 py-3 text-base font-bold text-white shadow-lg transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;