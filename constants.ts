import { FileFormat } from './types';

// Mime types for different file formats
export const MIMETYPE_MAP: Record<FileFormat, string> = {
  TXT: 'text/plain',
  MD: 'text/markdown',
  HTML: 'text/html',
  JSON: 'application/json',
  CSS: 'text/css',
  JS: 'application/javascript',
  XML: 'application/xml',
  CSV: 'text/csv',
  YAML: 'text/yaml',
};

// Reverse map for quick lookup from MIME type to FileFormat
export const REVERSE_MIMETYPE_MAP: Record<string, FileFormat> = Object.entries(MIMETYPE_MAP).reduce((acc, [format, mimeType]) => {
  acc[mimeType] = format as FileFormat;
  return acc;
}, {} as Record<string, FileFormat>);