import React, { useState } from 'react';
import { Search as SearchIcon, Loader, AlertCircle, Copy, Check } from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface SearchProps {
  onResultSelect?: (result: string) => void;
}

export const Search: React.FC<SearchProps> = ({ onResultSelect }) => {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{stringValue: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const searchResults = await api.search(query, 5);
      if (searchResults && searchResults.length > 0) {
        // Parse JSON strings if needed
        const parsedResults = searchResults.map((result: string | {stringValue: string}) => {
          if (typeof result === 'string') {
            try {
              return JSON.parse(result);
            } catch {
              return { stringValue: result };
            }
          }
          return result;
        });
        setResults(parsedResults);
      } else {
        setError('No results found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResult = (result: {stringValue: string}, index: number) => {
    const textToCopy = result.stringValue || '';
    navigator.clipboard.writeText(textToCopy);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={`rounded-xl border p-6 ${theme === 'light' ? 'border-gray-200 bg-white' : 'border-gray-800 bg-gray-900'}`}>
      <div className="mb-4">
        <h3 className={`text-lg font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
          Search Database
        </h3>
        <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
          Find relevant content from uploaded documents
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents..."
            disabled={isLoading}
            className={`flex-1 px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              theme === 'light'
                ? 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                : 'border-gray-700 bg-gray-800 text-white placeholder-gray-400'
            }`}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="btn-primary px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <SearchIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className={`flex items-gap-2 border rounded-lg p-3 mb-4 ${theme === 'light' ? 'bg-red-50 border-red-200' : 'bg-red-900/20 border-red-800'}`}>
          <AlertCircle className={`w-5 h-5 ${theme === 'light' ? 'text-red-600' : 'text-red-400'} flex-shrink-0 mt-0.5`} />
          <p className={`text-sm ${theme === 'light' ? 'text-red-700' : 'text-red-300'} ml-2`}>{error}</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className={`text-xs font-semibold uppercase ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} px-2 mb-2`}>
            {results.length} Result{results.length !== 1 ? 's' : ''}
          </p>
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <p className={`text-sm line-clamp-2 mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                {result.stringValue}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyResult(result, index)}
                  className={`flex-1 text-xs py-1 px-2 rounded transition-colors ${
                    copiedIndex === index
                      ? 'bg-green-500 text-white'
                      : theme === 'light'
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3 h-3 inline mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 inline mr-1" />
                      Copy
                    </>
                  )}
                </button>
                {onResultSelect && (
                  <button
                    onClick={() => onResultSelect(result.stringValue)}
                    className="flex-1 text-xs py-1 px-2 rounded bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                  >
                    Use
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && results.length === 0 && query && !error && (
        <div className={`text-center py-6 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
          <p className="text-sm">No results found for "{query}"</p>
        </div>
      )}

      {!isLoading && results.length === 0 && !query && !error && (
        <div className={`text-center py-6 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
          <SearchIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Enter a search query to find content</p>
        </div>
      )}
    </div>
  );
};
