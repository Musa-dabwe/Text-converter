import React, { useState } from 'react';
import { AppScreen } from '../types';
import HistoryTab from './HistoryTab';
// import SettingsTab from './SettingsTab'; // Removed SettingsTab

interface MyFilesScreenProps {
  navigateTo: (screen: AppScreen) => void;
}

// type MyFilesTab = 'history' | 'settings'; // Removed tab type

const MyFilesScreen: React.FC<MyFilesScreenProps> = ({ navigateTo }) => {
  // const [activeTab, setActiveTab] = useState<MyFilesTab>('history'); // Removed activeTab state

  return (
    <div className="relative mx-auto flex h-auto min-h-screen w-full max-w-md flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      {/* Top App Bar */}
      <div className="flex items-center p-4 pb-2 bg-background-light dark:bg-background-dark sticky top-0 z-10">
        <h1 className="flex-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Files</h1>
        <button className="flex size-10 items-center justify-center rounded-full text-slate-600 dark:text-slate-300">
          <span className="material-symbols-outlined text-2xl">more_vert</span>
        </button>
      </div>

      {/* Tabs - Removed tab navigation entirely */}
      {/* <div>
        <div className="border-b border-border-light dark:border-border-dark px-4">
          <nav className="flex justify-between -mb-px">
            <button
              onClick={() => setActiveTab('history')}
              className={`flex flex-1 flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4
                ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400'}`}>
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">History</p>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-1 flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4
                ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400'}`}>
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">Settings</p>
            </button>
          </nav>
        </div>
      </div> */}

      {/* Content now always shows HistoryTab */}
      <div className="flex flex-col flex-1">
        <HistoryTab navigateTo={navigateTo} />
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => navigateTo('convert-text')}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg">
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>
    </div>
  );
};

export default MyFilesScreen;