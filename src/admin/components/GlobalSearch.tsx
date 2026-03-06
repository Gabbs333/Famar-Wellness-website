// Global Search Component
// Provides unified search across all CMS content

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Image, Users, Calendar, Settings, Loader2 } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'page' | 'post' | 'media' | 'contact' | 'booking';
  title: string;
  subtitle?: string;
  path: string;
  icon: React.ReactNode;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search on query change
  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      
      try {
        // Simulated search - in production, this would call the API
        const mockResults: SearchResult[] = [];
        
        // Pages
        if (query.toLowerCase().includes('page')) {
          mockResults.push({
            id: 'page-1',
            type: 'page',
            title: 'Home Page',
            subtitle: 'Main landing page',
            path: '/admin/pages/edit/1',
            icon: <FileText className="w-4 h-4" />
          });
        }
        
        // Posts
        if (query.toLowerCase().includes('post') || query.toLowerCase().includes('blog')) {
          mockResults.push({
            id: 'post-1',
            type: 'post',
            title: 'Recent Blog Posts',
            subtitle: 'Manage blog articles',
            path: '/admin/posts',
            icon: <FileText className="w-4 h-4" />
          });
        }
        
        // Media
        if (query.toLowerCase().includes('media') || query.toLowerCase().includes('image')) {
          mockResults.push({
            id: 'media-1',
            type: 'media',
            title: 'Media Library',
            subtitle: 'Images and documents',
            path: '/admin/media',
            icon: <Image className="w-4 h-4" />
          });
        }
        
        // Contacts
        if (query.toLowerCase().includes('contact')) {
          mockResults.push({
            id: 'contact-1',
            type: 'contact',
            title: 'Contact Messages',
            subtitle: 'View submissions',
            path: '/admin/contacts',
            icon: <Users className="w-4 h-4" />
          });
        }
        
        // Bookings
        if (query.toLowerCase().includes('booking') || query.toLowerCase().includes('appointment')) {
          mockResults.push({
            id: 'booking-1',
            type: 'booking',
            title: 'Appointments',
            subtitle: 'Manage bookings',
            path: '/admin/bookings',
            icon: <Calendar className="w-4 h-4" />
          });
        }
        
        // Settings
        if (query.toLowerCase().includes('setting') || query.toLowerCase().includes('config')) {
          mockResults.push({
            id: 'settings-1',
            type: 'page',
            title: 'Settings',
            subtitle: 'CMS Configuration',
            path: '/admin/settings',
            icon: <Settings className="w-4 h-4" />
          });
        }

        setResults(mockResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          navigate(results[selectedIndex].path);
          onClose();
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  // Get icon color based on result type
  const getIconColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'page': return 'text-blue-600 bg-blue-100';
      case 'post': return 'text-purple-600 bg-purple-100';
      case 'media': return 'text-teal-600 bg-teal-100';
      case 'contact': return 'text-green-600 bg-green-100';
      case 'booking': return 'text-amber-600 bg-amber-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Search Modal */}
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-[15vh]">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center border-b border-gray-200 p-4">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search pages, posts, media, contacts..."
              className="flex-1 text-lg outline-none placeholder-gray-400"
            />
            {isLoading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
            <button
              onClick={onClose}
              className="ml-3 p-1 hover:bg-gray-100 rounded-md"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {/* Results */}
          {results.length > 0 && (
            <div className="max-h-[60vh] overflow-y-auto">
              <div className="p-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      navigate(result.path);
                      onClose();
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      index === selectedIndex 
                        ? 'bg-teal-50' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 ${getIconColor(result.type)}`}>
                      {result.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-sm text-gray-500">{result.subtitle}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {query.length >= 2 && results.length === 0 && !isLoading && (
            <div className="p-8 text-center">
              <p className="text-gray-500">No results found for "{query}"</p>
            </div>
          )}
          
          {/* Hint */}
          {query.length < 2 && (
            <div className="p-4 text-sm text-gray-500 border-t border-gray-100">
              <p>Type at least 2 characters to search</p>
            </div>
          )}
          
          {/* Keyboard Shortcuts */}
          <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span><kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↓</kbd> to navigate</span>
              <span><kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">Enter</kbd> to select</span>
              <span><kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">Esc</kbd> to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
