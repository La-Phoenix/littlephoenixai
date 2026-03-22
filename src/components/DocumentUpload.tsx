import React, { useState } from 'react';
import { Upload, Loader } from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export const DocumentUpload: React.FC = () => {
  const { theme } = useTheme();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [textInput, setTextInput] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const processFile = async (file: File) => {
    setIsLoading(true);

    try {
      // Read file content
      const text = await file.text();

      // Upload to API
      const response = await api.addDocument(text, {
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      });

      if (response.isSuccess) {
        addToast(`Document "${file.name}" uploaded successfully!`, 'success');
      } else {
        throw new Error(response.message || 'Failed to upload document');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document';
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
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!textInput.trim()) {
      addToast('Please enter some text to upload', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.addDocument(textInput);
      
      if (response.isSuccess) {
        addToast('Text content uploaded successfully!', 'success');
        setTextInput('');
      } else {
        throw new Error(response.message || 'Failed to upload text');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload text';
      addToast(errorMessage, 'error');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
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
              or click to browse (TXT, PDF, DOC, DOCX)
            </p>
          </>
        )}
      </div>
    </div>
  );
};
