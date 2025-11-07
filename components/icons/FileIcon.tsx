import React from 'react';

interface FileIconProps {
  mimeType?: string;
  fileName?: string; // Fallback if mimeType is not provided
}

const FileIcon: React.FC<FileIconProps> = ({ mimeType, fileName }) => {
  let iconName = 'description'; // Default icon for text/document

  if (mimeType) {
    if (mimeType.includes('text/plain') || mimeType.includes('text/markdown') || mimeType.includes('text/html')) {
      iconName = 'description';
    } else if (mimeType.includes('application/json') || mimeType.includes('application/xml') || mimeType.includes('text/yaml')) {
      iconName = 'data_object'; // For structured data like JSON, XML, YAML
    } else if (mimeType.includes('text/css') || mimeType.includes('application/javascript')) {
      iconName = 'code'; // For code files like CSS, JS
    } else if (mimeType.includes('text/csv')) {
      iconName = 'grid_on'; // For tabular data like CSV
    }
  } else if (fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'txt':
      case 'md':
      case 'html':
      case 'rtf':
        iconName = 'description';
        break;
      case 'json':
      case 'xml':
      case 'yaml':
      case 'yml':
        iconName = 'data_object';
        break;
      case 'css':
      case 'js':
      case 'jsx':
        iconName = 'code';
        break;
      case 'csv':
        iconName = 'grid_on';
        break;
      default:
        iconName = 'insert_drive_file'; // Generic file icon
    }
  }

  return (
    <span className="material-symbols-outlined text-2xl text-primary">
      {iconName}
    </span>
  );
};

export default FileIcon;