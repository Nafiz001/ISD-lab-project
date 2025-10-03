import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiClock, FiX } from 'react-icons/fi';
import { useAdvancedSearch } from '../hooks/useAdvancedSearch';
import { useProducts } from '../hooks/useProducts';

const SearchBox = ({ className = "", placeholder = "What are you looking for?" }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { products } = useProducts();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  const {
    searchHistory,
    getSearchSuggestions,
    addToHistory,
    clearHistory,
    getSpellingSuggestions
  } = useAdvancedSearch(products);
  
  const suggestions = getSearchSuggestions(searchQuery, 6);
  const spellingSuggestions = getSpellingSuggestions(searchQuery);
  const recentSearches = searchHistory.slice(0, 4);
  
  const allSuggestions = [
    ...suggestions.map(s => ({ type: 'suggestion', text: s })),
    ...(searchQuery.trim() && spellingSuggestions.length > 0 ? 
        spellingSuggestions.map(s => ({ type: 'spelling', text: s })) : []),
    ...(searchQuery.trim() === '' ? 
        recentSearches.map(h => ({ type: 'history', text: h.query })) : [])
  ];
  
  const handleSearch = (query = searchQuery) => {
    const trimmedQuery = query.trim();
    console.log('Performing search for:', trimmedQuery); // Debug log
    if (trimmedQuery) {
      addToHistory(trimmedQuery);
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      setSearchQuery('');
      setShowSuggestions(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < allSuggestions.length) {
      handleSearch(allSuggestions[selectedIndex].text);
    } else {
      handleSearch();
    }
  };
  
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : allSuggestions.length - 1
        );
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      case 'Tab':
        if (selectedIndex >= 0) {
          e.preventDefault();
          setSearchQuery(allSuggestions[selectedIndex].text);
          setSelectedIndex(-1);
        }
        break;
    }
  };
  
  const handleSuggestionClick = (suggestion) => {
    console.log('Suggestion clicked:', suggestion.text); // Debug log
    // Immediately hide suggestions and perform search
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setSearchQuery(''); // Clear input
    handleSearch(suggestion.text);
  };
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1);
    setShowSuggestions(value.trim().length > 0 || searchHistory.length > 0);
  };
  
  const handleInputFocus = () => {
    setShowSuggestions(searchQuery.trim().length > 0 || searchHistory.length > 0);
  };
  
  const handleInputBlur = (e) => {
    // Only hide if clicking outside the suggestions area
    const relatedTarget = e.relatedTarget;
    if (!suggestionsRef.current?.contains(relatedTarget)) {
      setTimeout(() => setShowSuggestions(false), 100);
    }
  };
  
  const handleSuggestionMouseDown = (e) => {
    // Prevent input blur when clicking on suggestions
    e.preventDefault();
    e.stopPropagation();
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };
    
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };
    
    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showSuggestions]);
  
  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'history':
        return <FiClock className="w-4 h-4 text-gray-400" />;
      case 'spelling':
        return <span className="text-xs text-blue-500 font-medium">ABC</span>;
      default:
        return <FiSearch className="w-4 h-4 text-gray-400" />;
    }
  };
  
  const getSuggestionLabel = (type) => {
    switch (type) {
      case 'history':
        return 'Recent';
      case 'spelling':
        return 'Did you mean?';
      default:
        return '';
    }
  };
  
  return (
    <div className={`relative ${className}`} ref={suggestionsRef}>
      <form onSubmit={handleSubmit} className="flex items-center bg-gray-100 rounded-md px-3 py-2">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="bg-transparent outline-none flex-1 text-sm"
          autoComplete="off"
        />
        <button type="submit" className="text-gray-500 hover:text-black ml-2">
          <FiSearch size={18} />
        </button>
      </form>
      
      {/* Suggestions Dropdown */}
      {showSuggestions && allSuggestions.length > 0 && (
        <div className="search-dropdown absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-80 overflow-y-auto">
          {/* Clear History Button */}
          {recentSearches.length > 0 && searchQuery.trim() === '' && (
            <div className="px-3 py-2 border-b border-gray-100">
              <button
                onClick={clearHistory}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
              >
                <FiX className="w-3 h-3" />
                Clear history
              </button>
            </div>
          )}
          
          {allSuggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.text}-${index}`}
              type="button"
              className={`search-suggestion w-full px-3 py-2 cursor-pointer flex items-center gap-3 hover:bg-gray-50 text-left ${
                selectedIndex === index ? 'selected bg-blue-50 border-l-2 border-blue-500' : ''
              }`}
              onMouseDown={handleSuggestionMouseDown}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {getSuggestionIcon(suggestion.type)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {getSuggestionLabel(suggestion.type) && (
                    <span className="text-xs text-gray-500 uppercase">
                      {getSuggestionLabel(suggestion.type)}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-900">{suggestion.text}</div>
              </div>
            </button>
          ))}
          
          {/* No Results Message */}
          {searchQuery.trim() && suggestions.length === 0 && spellingSuggestions.length === 0 && (
            <div className="px-3 py-4 text-center text-gray-500 text-sm">
              No suggestions found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
