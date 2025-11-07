import React, { useEffect } from 'react';
import { useFiles } from '../context/FileContext';
// import { useAuth } from '../context/AuthContext'; // Removed useAuth
import { AppScreen } from '../types';
// import FileIcon from './icons/FileIcon'; // Removed FileIcon as no files are displayed

interface HistoryTabProps {
  navigateTo: (screen: AppScreen) => void;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ navigateTo }) => {
  // const { files, loadingFiles, fileError, refreshFiles } = useFiles(); // Removed file-related state
  // const { isSignedIn, loadingAuth } = useAuth(); // Removed auth-related state

  // Removed useEffect for refreshing files

  // Removed file processing functions
  // const getFileNameAndExtension = (fullFileName: string) => { /* ... */ };
  // const displayFiles = files.map((file) => { /* ... */ });

  // Simplified loading/error states to just show the empty state
  // if (loadingFiles || loadingAuth) { /* ... */ }
  // if (fileError) { /* ... */ }
  // if (!isSignedIn) { /* ... */ }
  
  // Always display the "No Conversions Yet" empty state
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <div className="flex size-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <span className="material-symbols-outlined text-5xl text-slate-400 dark:text-slate-500">folder_off</span>
      </div>
      <h3 className="mt-6 text-lg font-semibold text-slate-900 dark:text-white">No Conversions Yet</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your downloaded files are saved locally. Tap the button below to create a new file.</p>
      <button
        onClick={() => navigateTo('convert-text')}
        className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white">
        Start New File
      </button>
    </div>
  );
};

export default HistoryTab;