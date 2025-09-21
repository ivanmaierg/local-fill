import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { IconButton } from './IconButton';

interface Snippet {
  id: string;
  name: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface SnippetLibraryProps {
  isDarkMode: boolean;
  isVisible: boolean;
  onClose: () => void;
  onApplySnippet?: (snippet: Snippet) => void;
}

export const SnippetLibrary: React.FC<SnippetLibraryProps> = ({
  isDarkMode,
  isVisible,
  onClose,
  onApplySnippet
}) => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSnippets();
  }, []);

  const loadSnippets = async () => {
    try {
      // TODO: Load snippets from storage
      // For now, use mock data
      const mockSnippets: Snippet[] = [
        {
          id: '1',
          name: 'Cover Letter - Software Engineer',
          content: 'I am excited to apply for the Software Engineer position at your company. With my experience in full-stack development and passion for creating innovative solutions, I believe I would be a valuable addition to your team.',
          category: 'cover-letters',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Why This Company',
          content: 'I am particularly drawn to your company because of your commitment to innovation and your mission to make technology more accessible. Your recent projects in AI and machine learning align perfectly with my interests and career goals.',
          category: 'responses',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Availability',
          content: 'I am available to start immediately and can work full-time. I am also open to discussing flexible arrangements that would work best for both parties.',
          category: 'responses',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setSnippets(mockSnippets);
    } catch (error) {
      console.error('Failed to load snippets:', error);
    }
  };

  const categories = ['all', 'cover-letters', 'responses', 'questions'];
  const categoryLabels = {
    'all': 'All Snippets',
    'cover-letters': 'Cover Letters',
    'responses': 'Common Responses',
    'questions': 'Questions'
  };

  const filteredSnippets = snippets.filter(snippet => {
    const matchesCategory = selectedCategory === 'all' || snippet.category === selectedCategory;
    const matchesSearch = snippet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         snippet.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApplySnippet = (snippet: Snippet) => {
    if (onApplySnippet) {
      onApplySnippet(snippet);
    }
    onClose();
  };

  const CloseIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const SearchIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className={`relative w-full max-w-2xl max-h-[80vh] rounded-lg shadow-xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Snippet Library
          </h2>
          <IconButton
            onClick={onClose}
            icon={<CloseIcon />}
            isDarkMode={isDarkMode}
            ariaLabel="Close snippet library"
          />
        </div>

        {/* Search and Filters */}
        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search snippets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Category Filter */}
          <div className="flex space-x-2">
            {categories.map(category => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'primary' : 'secondary'}
                size="sm"
                isDarkMode={isDarkMode}
              >
                {categoryLabels[category as keyof typeof categoryLabels]}
              </Button>
            ))}
          </div>
        </div>

        {/* Snippets List */}
        <div className="px-4 pb-4 max-h-96 overflow-y-auto">
          {filteredSnippets.length === 0 ? (
            <div className={`text-center py-8 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {searchQuery ? 'No snippets found matching your search.' : 'No snippets available.'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSnippets.map(snippet => (
                <div
                  key={snippet.id}
                  className={`p-3 border rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {snippet.name}
                      </h3>
                      <p className={`text-sm mt-1 line-clamp-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {snippet.content}
                      </p>
                      <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                        isDarkMode
                          ? 'bg-gray-600 text-gray-300'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {categoryLabels[snippet.category as keyof typeof categoryLabels]}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleApplySnippet(snippet)}
                      variant="primary"
                      size="sm"
                      isDarkMode={isDarkMode}
                      className="ml-3"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
