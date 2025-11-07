import React from 'react';
import FileIcon from '../icons/FileIcon';

interface FileDisplayProps {
  fileName: string;
  fileSize: string;
  mimeType: string;
}

const FileDisplay: React.FC<FileDisplayProps> = ({ fileName, fileSize, mimeType }) => {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
        <FileIcon mimeType={mimeType} />
      </div>
      <div className="flex-1">
        <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal line-clamp-1">{fileName}</p>
        <p className="text-subtext-light dark:text-subtext-dark text-sm">{fileSize}</p>
      </div>
    </div>
  );
};

export default FileDisplay;