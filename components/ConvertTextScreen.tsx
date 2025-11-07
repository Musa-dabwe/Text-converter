import React, { useState, useRef } from 'react';
import { AppScreen, FileFormat } from '../types';
import { useFiles } from '../context/FileContext';
import FileDisplay from './ui/FileDisplay';
import { MIMETYPE_MAP, REVERSE_MIMETYPE_MAP } from '../constants';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai"; // Import Gemini API
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown
import rehypeRaw from 'rehype-raw'; // To handle raw HTML within markdown

interface ConvertTextScreenProps {
  navigateTo: (screen: AppScreen) => void;
}

// Utility function to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const ConvertTextScreen: React.FC<ConvertTextScreenProps> = ({ navigateTo }) => {
  const { downloadFile, fileError } = useFiles();
  
  // States for Text-to-Text conversion
  const [selectedFormat, setSelectedFormat] = useState<FileFormat>('TXT');
  const [editorContent, setEditorContent] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; mimeType: string; id?: string } | null>(null);
  const [isConvertingAI, setIsConvertingAI] = useState(false); // For AI text conversion specific loading

  // States for Image-to-Code conversion
  const [conversionMode, setConversionMode] = useState<'text-to-text' | 'image-to-code'>('text-to-text');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [imageConversionResult, setImageConversionResult] = useState<string | null>(null);
  const [isGeneratingImageCode, setIsGeneratingImageCode] = useState(false); // For AI image conversion specific loading


  const [loading, setLoading] = useState(false); // For general loading (file read/download)
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to detect file format
  const detectFileFormat = (fileName: string, mimeType: string): FileFormat => {
    // Try to match by MIME type first using the reverse map
    if (REVERSE_MIMETYPE_MAP[mimeType]) {
      return REVERSE_MIMETYPE_MAP[mimeType];
    }

    // Fallback to extension if MIME type doesn't give a direct match or is generic
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'txt': return 'TXT';
      case 'md': return 'MD';
      case 'html': return 'HTML';
      case 'json': return 'JSON';
      case 'css': return 'CSS';
      case 'js':
      case 'jsx': return 'JS';
      case 'xml': return 'XML';
      case 'csv': return 'CSV';
      case 'yaml':
      case 'yml': return 'YAML';
      default: return 'TXT'; // Default to TXT if no specific format is detected
    }
  };

  // Helper function to get a user-friendly format description for AI prompt
  const getFileFormatDescription = (format: FileFormat): string => {
    switch (format) {
      case 'TXT': return 'plain text';
      case 'MD': return 'Markdown';
      case 'HTML': return 'HTML markup';
      case 'JSON': return 'JSON data';
      case 'CSS': return 'CSS stylesheets';
      case 'JS': return 'JavaScript code';
      case 'XML': return 'XML markup';
      case 'CSV': return 'Comma Separated Values';
      case 'YAML': return 'YAML data';
      default: return 'unspecified format';
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage(null);
    setLoading(true); // General loading indicator

    if (conversionMode === 'text-to-text') {
      try {
        const fileContent = await file.text();
        setEditorContent(fileContent);
        setSelectedFile({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          mimeType: file.type || 'text/plain',
        });

        const detectedFormat = detectFileFormat(file.name, file.type);
        setSelectedFormat(detectedFormat);
        setMessage(`Loaded "${file.name}" for editing.`);
      } catch (error) {
        console.error('Error reading text file:', error);
        setMessage('Failed to read text file. Please ensure it is a plain text file.');
      } finally {
        setLoading(false);
      }
    } else if (conversionMode === 'image-to-code') {
      try {
        if (!file.type.startsWith('image/')) {
          setMessage('Please upload an image file (e.g., JPG, PNG, WEBP).');
          return;
        }
        const base64Data = await fileToBase64(file);
        setSelectedImageFile(file);
        setSelectedImageBase64(base64Data);
        setMessage(`Image "${file.name}" loaded. Ready to generate code.`);
        setImageConversionResult(null); // Clear previous result on new image upload
      } catch (error) {
        console.error('Error reading image file:', error);
        setMessage('Failed to read image file.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveTextConversion = async () => {
    if (!editorContent.trim()) {
      setMessage('Editor is empty. Please enter some text to download.');
      return;
    }

    setLoading(true);
    setMessage(null);
    let contentToDownload = editorContent;
    const defaultFileName = selectedFile?.name.split('.').slice(0, -1).join('.') || `Untitled_${Date.now()}`;

    try {
      if (!process.env.API_KEY) {
        setMessage('API Key not configured. AI conversion skipped. Downloading original content.');
      } else {
        setIsConvertingAI(true);
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const formatDescription = getFileFormatDescription(selectedFormat);
        const inputFormatDescription = getFileFormatDescription(detectFileFormat(selectedFile?.name || 'temp.txt', selectedFile?.mimeType || 'text/plain'));

        setMessage(`AI is converting content from ${inputFormatDescription} to ${formatDescription}...`);

        const prompt = `You are a highly accurate file format converter. Convert the following content from ${inputFormatDescription} to ${formatDescription} format. Ensure all syntax, structure, and formatting conform strictly to the target format's standards. Do not add any introductory or concluding remarks, explanations, or extraneous text; provide only the converted content.

Content to convert:
\`\`\`
${editorContent}
\`\`\`
`;
        const response: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash', // Use gemini-2.5-flash for text conversion
          contents: prompt,
          config: {
            temperature: 0.1, // Lower temperature for more deterministic output
            topK: 1, // Focus on highest probability tokens
            topP: 0.9,
          }
        });

        const aiText = response.text.trim();
        if (aiText) {
          contentToDownload = aiText;
          setMessage(`AI conversion complete. Preparing to download "${defaultFileName}.${selectedFormat.toLowerCase()}".`);
        } else {
          setMessage('AI conversion returned empty content. Downloading original content.');
        }
      }

      downloadFile(defaultFileName, contentToDownload, selectedFormat);
      if (!message || message.includes('AI conversion returned empty') || message.includes('AI conversion skipped')) {
        setMessage(`Successfully downloaded "${defaultFileName}.${selectedFormat.toLowerCase()}".`);
      }

    } catch (error: any) {
      console.error('Error during AI conversion or download:', error);
      setMessage(`Operation failed: ${error.message || 'Unknown error during conversion or download.'}`);
    } finally {
      setLoading(false);
      setIsConvertingAI(false);
    }
  };

  const handleDownloadMarkdown = () => {
    if (imageConversionResult) {
      downloadFile('ui_code_output', imageConversionResult, 'MD');
      setMessage('Generated UI code downloaded as Markdown.');
    } else {
      setMessage('No generated code to download.');
    }
  };

  const handleGenerateImageCode = async () => {
    if (!selectedImageBase64) {
      setMessage('Please upload an image first.');
      return;
    }
    if (!process.env.API_KEY) {
      setMessage('API Key not configured. Image-to-code generation skipped.');
      return;
    }

    setImageConversionResult(null);
    setIsGeneratingImageCode(true);
    setMessage('Generating Android UI XML and Kotlin code from image...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Remove "data:image/jpeg;base64," prefix from base64 string
      const base64Stripped = selectedImageBase64.split(',')[1]; 

      const imagePart = {
        inlineData: {
          mimeType: selectedImageFile?.type || 'image/jpeg',
          data: base64Stripped,
        },
      };
      const textPart = {
        text: `You are an expert Android UI/UX developer. Your task is to analyze the provided image of a UI design and translate it into functional Android XML layout code and corresponding Kotlin code for basic logic.

Present your response in Markdown format.
First, provide a brief explanation of the UI components identified and any assumptions made.
Then, provide the XML layout code for 'activity_main.xml' within a Markdown XML code block (like \`\`\`xml).
After that, provide the Kotlin code for 'MainActivity.kt' (including necessary imports and basic setup like onCreate for the corresponding layout) within a Markdown Kotlin code block (like \`\`\`kotlin).
Ensure the code is clean, well-structured, and includes comments where necessary. Use standard Android components like LinearLayout, RelativeLayout, ConstraintLayout, TextView, Button, EditText, ImageView, RecyclerView as appropriate. Focus on a simple, functional implementation.
Do not include any other introductory or concluding text outside of the requested Markdown format.
`,
      };

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // gemini-2.5-flash supports multimodal input
        contents: { parts: [imagePart, textPart] },
        config: {
          temperature: 0.1, // Lower temperature for more deterministic output
          topK: 1, // Focus on highest probability tokens
          topP: 0.9,
        }
      });

      const aiText = response.text.trim();
      if (aiText) {
        setImageConversionResult(aiText);
        setMessage('Android UI code generated successfully!');
      } else {
        setMessage('AI returned empty content for image-to-code conversion.');
      }
    } catch (error: any) {
      console.error('Error during AI image-to-code conversion:', error);
      let errorMessage = 'Unknown error during AI image-to-code conversion.';
      if (error.message.includes("Rpc failed due to xhr error") || error.code === 500) {
        errorMessage = `Failed to generate code: There was an issue connecting to the AI service. This might be due to a temporary network problem, or an issue with your API key configuration (e.g., billing, permissions). Please ensure your API key is valid and properly set up, and try again. Detailed error: ${error.message}`;
      } else {
        errorMessage = `Failed to generate code: ${error.message || 'Unknown error.'}`;
      }
      setMessage(errorMessage);
    } finally {
      setIsGeneratingImageCode(false);
    }
  };


  const renderFormatButtons = (formats: FileFormat[]) => (
    <div className="grid grid-cols-3 gap-3">
      {formats.map((format) => (
        <button
          key={format}
          onClick={() => setSelectedFormat(format)}
          className={`flex h-12 cursor-pointer items-center justify-center gap-x-2 rounded-lg
            ${selectedFormat === format
              ? 'bg-primary/10 border-2 border-primary ring-2 ring-primary/20 text-primary font-bold'
              : 'bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark font-medium'
            } text-sm leading-normal transition-colors`}>
          {format}
        </button>
      ))}
    </div>
  );

  const isSaveDisabled = loading || isConvertingAI || isGeneratingImageCode;

  // Custom components for ReactMarkdown to apply Tailwind CSS
  const markdownComponents = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h1: ({ node, ...props }: any) => <h1 className="text-xl font-bold mt-4 mb-2 text-text-light dark:text-text-dark" {...props} />,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h2: ({ node, ...props }: any) => <h2 className="text-lg font-bold mt-3 mb-1 text-text-light dark:text-text-dark" {...props} />,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h3: ({ node, ...props }: any) => <h3 className="text-base font-bold mt-2 mb-1 text-text-light dark:text-text-dark" {...props} />,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p: ({ node, ...props }: any) => <p className="mb-2 text-text-light dark:text-text-dark" {...props} />,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ul: ({ node, ...props }: any) => <ul className="list-disc pl-5 mb-2 text-text-light dark:text-text-dark" {...props} />,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ol: ({ node, ...props }: any) => <ol className="list-decimal pl-5 mb-2 text-text-light dark:text-text-dark" {...props} />,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    li: ({ node, ...props }: any) => <li className="mb-1 text-text-light dark:text-text-dark" {...props} />,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    a: ({ node, ...props }: any) => <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pre: ({ node, ...props }: any) => <pre className="bg-slate-800 p-3 rounded-lg overflow-x-auto my-3" {...props} />,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code: ({ node, className, children, ...props }: any) => {
      const isBlock = className && className.startsWith('language-');
      return isBlock ? (
        <code className="block text-white text-sm font-mono overflow-x-auto" {...props}>
          {children}
        </code>
      ) : (
        <code className="bg-slate-200 dark:bg-slate-700 rounded px-1 py-0.5 text-red-600 dark:text-red-300 text-sm font-mono" {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <>
      <header className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-border-light dark:border-border-dark">
        <button
          onClick={() => navigateTo('my-files')}
          className="flex size-10 shrink-0 items-center justify-center text-text-light dark:text-text-dark">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h1 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">
          {conversionMode === 'text-to-text' ? 'Convert Text' : 'Image to UI Code'}
        </h1>
      </header>

      {/* Mode Switcher */}
      <div className="flex gap-2 p-4 pt-2">
        <button
          onClick={() => {
            setConversionMode('text-to-text');
            setMessage(null);
            setEditorContent('');
            setSelectedFile(null);
            setImageConversionResult(null);
            setSelectedImageFile(null);
            setSelectedImageBase64(null);
            setIsGeneratingImageCode(false);
          }}
          className={`flex-1 py-2 rounded-lg text-sm font-bold ${
            conversionMode === 'text-to-text'
              ? 'bg-primary text-white'
              : 'bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark border border-border-light dark:border-border-dark'
          }`}>
          Text Converter
        </button>
        <button
          onClick={() => {
            setConversionMode('image-to-code');
            setMessage(null);
            setEditorContent('');
            setSelectedFile(null);
            setImageConversionResult(null);
            setSelectedImageFile(null);
            setSelectedImageBase64(null);
            setIsConvertingAI(false);
          }}
          className={`flex-1 py-2 rounded-lg text-sm font-bold ${
            conversionMode === 'image-to-code'
              ? 'bg-primary text-white'
              : 'bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark border border-border-light dark:border-border-dark'
          }`}>
          Image to UI Code
        </button>
      </div>

      <main className="flex flex-col flex-1 p-4 gap-6">
        {/* Conditional rendering based on conversionMode */}
        {conversionMode === 'text-to-text' ? (
          <>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em]">Selected File</h2>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary text-sm font-medium">
                  Change
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.md,.html,.json,.css,.js,.xml,.csv,.yaml,.yml,text/*,application/json,application/javascript,application/xml" />
              </div>
              <FileDisplay
                fileName={selectedFile?.name || 'No file selected'}
                fileSize={selectedFile?.size || '0 KB'}
                mimeType={selectedFile?.mimeType || 'application/octet-stream'}
              />
            </div>

            {/* Text editor */}
            <div className="flex flex-col gap-2">
              <h2 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em]">Edit Content</h2>
              <textarea
                className="form-textarea w-full min-h-[150px] resize-y rounded-lg border border-border-light bg-card-light px-4 py-3 text-base font-normal leading-normal text-text-light placeholder-subtext-light focus:outline-none focus:ring-2 focus:ring-primary dark:border-border-dark dark:bg-card-dark dark:text-text-dark dark:placeholder-subtext-dark"
                placeholder="Start typing or load a file..."
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
              ></textarea>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em] pb-1">Convert to Text</h2>
                <p className="text-subtext-light dark:text-subtext-dark text-sm">Select a text-based output format.</p>
              </div>
              {renderFormatButtons(['TXT', 'MD', 'HTML', 'JSON', 'CSS', 'JS', 'XML', 'CSV', 'YAML'])}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em]">Upload UI Mockup Image</h2>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary text-sm font-medium">
                  {selectedImageFile ? 'Change Image' : 'Select Image'}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark min-h-[150px]">
                {selectedImageBase64 ? (
                  <img src={selectedImageBase64} alt="Selected UI Mockup" className="max-w-full max-h-[200px] object-contain rounded-lg shadow-md" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-subtext-light dark:text-subtext-dark">
                    <span className="material-symbols-outlined text-4xl mb-2">upload_file</span>
                    <span>No image selected</span>
                  </div>
                )}
                {selectedImageFile && (
                  <p className="text-sm text-subtext-light dark:text-subtext-dark mt-2">{selectedImageFile.name} ({(selectedImageFile.size / 1024).toFixed(1)} KB)</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em]">Generated Android UI Code</h2>
              <p className="text-subtext-light dark:text-subtext-dark text-sm">
                The AI will generate XML for the layout and Kotlin for basic logic.
              </p>
              <div
                className="markdown-output bg-card-light dark:bg-card-dark rounded-lg p-4 font-mono text-sm overflow-auto max-h-[500px] border border-border-light dark:border-border-dark"
              >
                {imageConversionResult ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={markdownComponents}
                  >
                    {imageConversionResult}
                  </ReactMarkdown>
                ) : (
                  <span className="text-subtext-light dark:text-subtext-dark">Generated code will appear here after analysis. This may take a moment.</span>
                )}
              </div>
              {imageConversionResult && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg text-primary text-sm">
                  <h3 className="font-bold mb-1">How to use this code:</h3>
                  <p>1. **XML Layout:** Copy the content from the `xml` code block into `app/src/main/res/layout/activity_main.xml` in your Android Studio project (create if it doesn't exist).</p>
                  <p>2. **Kotlin Logic:** Copy the content from the `kotlin` code block into `app/src/main/java/com/yourpackage/MainActivity.kt` (replace `com.yourpackage` with your actual package name).</p>
                  <p>3. **Dependencies:** Ensure you have necessary dependencies (e.g., `androidx.constraintlayout.widget.ConstraintLayout` if used) in your `build.gradle` file.</p>
                  <p>4. **Adjust:** Review and adjust the generated code to fit your project's specific needs, themes, and string resources.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Loading/Message display */}
        {(loading || isConvertingAI || isGeneratingImageCode) && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="ml-3 text-subtext-light dark:text-subtext-dark text-center">
              {message}
            </p>
          </div>
        )}
        {(message && !(loading || isConvertingAI || isGeneratingImageCode) || fileError) && ( // Display message if not loading, or if fileError
          <p className={`text-center text-sm ${message?.includes('Successfully') || message?.includes('generated successfully') || message?.includes('downloaded') ? 'text-green-500' : 'text-red-500'}`}>
            {message || fileError}
          </p>
        )}
      </main>
      <footer className="sticky bottom-0 bg-background-light dark:bg-background-dark p-4 border-t border-border-light dark:border-border-dark">
        {conversionMode === 'text-to-text' ? (
          <button
            onClick={handleSaveTextConversion}
            disabled={isSaveDisabled}
            className="flex w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed">
            <span className="truncate">Download as {selectedFormat}</span>
          </button>
        ) : (
          <button
            onClick={imageConversionResult ? handleDownloadMarkdown : handleGenerateImageCode}
            disabled={isSaveDisabled || !selectedImageBase64}
            className="flex w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed">
            <span className="truncate">
              {imageConversionResult ? 'Download Generated Markdown' : 'Generate UI Code'}
            </span>
          </button>
        )}
      </footer>
    </>
  );
};

export default ConvertTextScreen;