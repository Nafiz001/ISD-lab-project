import { useState, useEffect, useMemo } from 'react';

// Simple Levenshtein distance algorithm for spell checking
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Search history utilities
const SEARCH_HISTORY_KEY = 'searchHistory';
const MAX_HISTORY_ITEMS = 10;

const getSearchHistory = () => {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading search history:', error);
    return [];
  }
};

const saveToSearchHistory = (query) => {
  if (!query.trim()) return;
  
  try {
    const history = getSearchHistory();
    const normalizedQuery = query.toLowerCase().trim();
    
    // Remove existing entry if it exists
    const filteredHistory = history.filter(
      item => item.query.toLowerCase() !== normalizedQuery
    );
    
    // Add new entry at the beginning
    const newHistory = [
      { query: query.trim(), timestamp: new Date().toISOString() },
      ...filteredHistory
    ].slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Error saving to search history:', error);
  }
};

export const useAdvancedSearch = (products = []) => {
  const [searchHistory, setSearchHistory] = useState([]);
  
  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);
  
  // Generate search suggestions based on products
  const suggestions = useMemo(() => {
    if (!products.length) return [];
    
    const allTerms = new Set();
    
    products.forEach(product => {
      // Add product names
      allTerms.add(product.name.toLowerCase());
      
      // Add individual words from product names
      product.name.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 2) allTerms.add(word);
      });
      
      // Add categories
      if (product.category) {
        allTerms.add(product.category.toLowerCase());
      }
      
      // Add brands if available
      if (product.brand) {
        allTerms.add(product.brand.toLowerCase());
      }
      
      // Add description keywords
      if (product.description) {
        product.description.toLowerCase()
          .split(/\s+/)
          .filter(word => word.length > 3)
          .slice(0, 5) // Limit description words
          .forEach(word => allTerms.add(word));
      }
    });
    
    return Array.from(allTerms).sort();
  }, [products]);
  
  // Get search suggestions based on input
  const getSearchSuggestions = (query, limit = 8) => {
    if (!query.trim()) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    const matchingSuggestions = suggestions.filter(suggestion =>
      suggestion.includes(normalizedQuery)
    );
    
    // Sort by relevance (exact matches first, then starts with, then contains)
    const sorted = matchingSuggestions.sort((a, b) => {
      if (a === normalizedQuery) return -1;
      if (b === normalizedQuery) return 1;
      if (a.startsWith(normalizedQuery) && !b.startsWith(normalizedQuery)) return -1;
      if (b.startsWith(normalizedQuery) && !a.startsWith(normalizedQuery)) return 1;
      return a.localeCompare(b);
    });
    
    return sorted.slice(0, limit);
  };
  
  // Enhanced search with spell correction
  const searchProducts = (query) => {
    if (!query.trim() || !products.length) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    const queryWords = normalizedQuery.split(/\s+/);
    
    const searchResults = products.map(product => {
      let score = 0;
      const productText = [
        product.name,
        product.description || '',
        product.category || '',
        product.brand || ''
      ].join(' ').toLowerCase();
      
      // Exact match scoring
      if (productText.includes(normalizedQuery)) {
        score += 100;
      }
      
      // Word-by-word matching with spell correction
      queryWords.forEach(queryWord => {
        if (queryWord.length < 2) return;
        
        const productWords = productText.split(/\s+/);
        
        productWords.forEach(productWord => {
          if (productWord.length < 2) return;
          
          // Exact word match
          if (productWord === queryWord) {
            score += 50;
          }
          // Partial match
          else if (productWord.includes(queryWord)) {
            score += 30;
          }
          // Spell correction (allow 1-2 character differences)
          else {
            const distance = levenshteinDistance(queryWord, productWord);
            const maxDistance = Math.min(2, Math.floor(queryWord.length / 3));
            
            if (distance <= maxDistance && queryWord.length > 3) {
              score += Math.max(10, 25 - distance * 5);
            }
          }
        });
      });
      
      // Boost score for matches in product name
      if (product.name.toLowerCase().includes(normalizedQuery)) {
        score += 25;
      }
      
      // Boost score for category matches
      if (product.category && product.category.toLowerCase().includes(normalizedQuery)) {
        score += 20;
      }
      
      return { ...product, searchScore: score };
    });
    
    // Filter and sort by score
    return searchResults
      .filter(product => product.searchScore > 0)
      .sort((a, b) => b.searchScore - a.searchScore);
  };
  
  // Add query to search history
  const addToHistory = (query) => {
    saveToSearchHistory(query);
    setSearchHistory(getSearchHistory());
  };
  
  // Clear search history
  const clearHistory = () => {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    setSearchHistory([]);
  };
  
  // Get spell correction suggestions
  const getSpellingSuggestions = (query) => {
    if (!query.trim() || query.length < 3) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    const spellingSuggestions = [];
    
    suggestions.forEach(suggestion => {
      const distance = levenshteinDistance(normalizedQuery, suggestion);
      const maxDistance = Math.min(2, Math.floor(normalizedQuery.length / 3));
      
      if (distance > 0 && distance <= maxDistance) {
        spellingSuggestions.push({
          suggestion,
          distance,
          confidence: Math.max(0, 100 - (distance * 25))
        });
      }
    });
    
    return spellingSuggestions
      .sort((a, b) => a.distance - b.distance || b.confidence - a.confidence)
      .slice(0, 3)
      .map(item => item.suggestion);
  };
  
  return {
    searchHistory,
    suggestions,
    getSearchSuggestions,
    searchProducts,
    addToHistory,
    clearHistory,
    getSpellingSuggestions
  };
};
