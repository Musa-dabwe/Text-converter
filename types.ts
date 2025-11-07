export type AppScreen = 'onboarding' | 'my-files' | 'convert-text';

export type FileFormat = 'TXT' | 'MD' | 'HTML' | 'JSON' | 'CSS' | 'JS' | 'XML' | 'CSV' | 'YAML';

export interface FileData {
  id: string; // Keep ID for potential future local management or reference, though not used for Drive anymore
  name: string;
  size: string; // e.g., "128 KB"
  mimeType: string; // e.g., "text/plain"
  convertedTo?: FileFormat; // The format it was converted to, if applicable
  conversionDate?: string; // Date of conversion
}