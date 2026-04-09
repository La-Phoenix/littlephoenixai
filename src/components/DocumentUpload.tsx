import React, { useState } from 'react';
import { Upload, Loader, X } from 'lucide-react';
import * as mammoth from 'mammoth';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

// Simple file text extraction
const extractTextFromFile = async (file: File): Promise<string> => {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.pdf')) {
    // Extract text from PDF using global pdfjsLib from HTML
    try {
      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) {
        throw new Error('PDF.js library not loaded');
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        fullText += pageText + '\n';
      }

      return fullText || 'No text content found in PDF';
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error(`Failed to extract PDF text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } else if (fileName.endsWith('.docx')) {
    // Extract text from DOCX
    const arrayBuffer = await file.arrayBuffer();
    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('DOCX extraction error:', error);
      throw new Error('Failed to extract DOCX text. Please ensure it\'s a valid DOCX file.');
    }
  } else {
    // For TXT and other files, use file.text()
    return await file.text();
  }
};

export const DocumentUpload: React.FC = () => {
  const { theme } = useTheme();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [previewContent, setPreviewContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewFileName, setPreviewFileName] = useState<string>('');
  const [isSavingPreview, setIsSavingPreview] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const processFile = async (file: File) => {
    const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      addToast(`File size exceeds 1 MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)} MB.`, 'error');
      return;
    }

    setIsLoading(true);

    try {
      // Extract text from file based on type
      const text = await extractTextFromFile(file);

      if (!text.trim()) {
        throw new Error('No text content found in file');
      }

      // Show preview
      setPreviewContent(text);
      setPreviewFileName(file.name);
      setShowPreview(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process document';
      addToast(errorMessage, 'error');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    handleDrag(e);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!textInput.trim()) {
      addToast('Please enter some text to upload', 'error');
      return;
    }

    // Show preview
    setPreviewContent(textInput);
    setPreviewFileName('Text Content');
    setShowPreview(true);
  };

  const savePreview = async () => {
    setIsSavingPreview(true);

    try {
      const response = await api.addDocument(previewContent, {
        fileName: previewFileName,
        uploadedAt: new Date().toISOString(),
      });

      if (response.isSuccess) {
        addToast(`"${previewFileName}" uploaded successfully!`, 'success');
        closePreview();
      } else {
        throw new Error(response.message || 'Failed to upload content');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload content';
      addToast(errorMessage, 'error');
      console.error('Upload error:', err);
    } finally {
      setIsSavingPreview(false);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewContent('');
    setPreviewFileName('');
    setTextInput('');
  };

  return (
    <div className={`rounded-xl border p-6 ${theme === 'light' ? 'border-gray-200 bg-white' : 'border-gray-800 bg-gray-900'}`}>
      <div className="mb-4">
        <h3 className={`text-lg font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
          Add Content
        </h3>
        <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
          Paste or type text for the AI to learn from
        </p>
      </div>

      {/* Text Input Section */}
      <form onSubmit={handleTextSubmit} className="mb-4">
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Paste or type your content here..."
          disabled={isLoading}
          className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-32 ${
            theme === 'light'
              ? 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
              : 'border-gray-700 bg-gray-800 text-white placeholder-gray-400'
          }`}
        />
        <div className="flex gap-3 mt-3">
          <button
            type="submit"
            disabled={isLoading || !textInput.trim()}
            className="flex-1 btn-primary py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Submit Text
              </>
            )}
          </button>
        </div>
      </form>

      {/* Divider */}
      <div className={`my-6 border-t ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}></div>

      {/* File Upload Section */}
      <div className="mb-4">
        <p className={`text-sm font-medium mb-3 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
          Or upload a file
        </p>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
          isDragActive
            ? `border-purple-500 ${theme === 'light' ? 'bg-purple-50' : 'bg-purple-900/20'}`
            : `${theme === 'light' ? 'border-gray-300 hover:border-purple-400' : 'border-gray-700 hover:border-purple-600'}`
        }`}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleChange}
          disabled={isLoading}
          accept=".txt,.pdf,.doc,.docx"
          className="hidden"
          aria-label="Upload document"
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader className="w-8 h-8 animate-spin text-purple-600" />
            <p className={`text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
              Uploading...
            </p>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className={`text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
              Drag and drop your file here
            </p>
            <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
              or click to browse (TXT, PDF, DOC, DOCX) • Max 1 MB
            </p>
          </>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closePreview}>
          <div className={`${theme === 'light' ? 'bg-white' : 'bg-gray-900'} rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col`} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${theme === 'light' ? 'border-gray-200' : 'border-gray-800'}`}>
              <div className="flex-1">
                <h2 className={`text-lg font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                  Preview Content
                </h2>
                <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                  {previewFileName}
                </p>
              </div>
              <button
                onClick={closePreview}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${theme === 'light' ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-gray-800 text-gray-400'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className={`flex-1 overflow-y-auto p-6 ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
              <div className={`p-4 rounded-lg ${theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-700 border border-gray-600'}`}>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                  {previewContent.substring(0, 2000)}{previewContent.length > 2000 && '...'}
                </p>
              </div>
              {previewContent.length > 2000 && (
                <p className={`text-xs mt-2 text-center ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Showing first 2000 characters of {previewContent.length} total
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`flex gap-3 p-6 border-t ${theme === 'light' ? 'border-gray-200' : 'border-gray-800'}`}>
              <button
                onClick={closePreview}
                disabled={isSavingPreview}
                className={`flex-1 px-4 py-3 rounded-lg transition-colors font-medium ${theme === 'light' ? 'bg-gray-200 text-gray-900 hover:bg-gray-300' : 'bg-gray-700 text-white hover:bg-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Cancel
              </button>
              <button
                onClick={savePreview}
                disabled={isSavingPreview}
                className="flex-1 px-4 py-3 rounded-lg transition-colors font-medium bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSavingPreview ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Save Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
