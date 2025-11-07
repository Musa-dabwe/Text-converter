import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
// Removed Google Drive service imports
// import { listFiles, saveFile as saveFileToDrive, loadFileContent } from '../services/googleDriveService';
import { FileFormat } from '../types';
import { MIMETYPE_MAP } from '../constants'; // Import MIMETYPE_MAP

// Removed AuthContext dependency
// import { useAuth } from './AuthContext'; 

interface FileContextType {
  // Removed files, loadingFiles, refreshFiles, loadFile
  // files: DriveFile[];
  // loadingFiles: boolean;
  fileError: string | null; // Retain for download errors
  // refreshFiles: () => Promise<void>;
  downloadFile: (fileName: string, content: string, format?: FileFormat) => void; // New download function
  // loadFile: (fileId: string) => Promise<string>;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  // Removed auth dependency
  // const { isSignedIn, loadingAuth } = useAuth(); 
  // Removed files state
  // const [files, setFiles] = useState<DriveFile[]>([]); 
  const [fileError, setFileError] = useState<string | null>(null);

  // Removed refreshFiles, saveFileToDrive, loadFile functions

  const downloadFile = useCallback((fileName: string, content: string, format: FileFormat = 'TXT') => {
    setFileError(null); // Clear previous errors
    try {
      const mimeType = MIMETYPE_MAP[format] || MIMETYPE_MAP.TXT;
      const fullFileName = `${fileName}.${format.toLowerCase()}`;

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fullFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // Clean up the URL object

    } catch (error: any) {
      console.error('Error downloading file:', error);
      setFileError(error.message || 'Failed to download file.');
    }
  }, []);

  return (
    <FileContext.Provider value={{ fileError, downloadFile }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFiles = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};