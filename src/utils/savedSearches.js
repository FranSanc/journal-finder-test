// Utility functions for managing saved searches in localStorage

const STORAGE_KEY = "frontiers_saved_searches";

export const SavedSearchesService = {
  // Get all saved searches
  getAll: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading saved searches:", error);
      return [];
    }
  },

  // Save a new search
  save: (searchData) => {
    try {
      const searches = SavedSearchesService.getAll();
      const newSearch = {
        id: Date.now().toString(),
        name: searchData.name || `Search ${searches.length + 1}`,
        title: searchData.title || "",
        abstract: searchData.abstract || "",
        keywords: searchData.keywords || "",
        aims: searchData.aims || "",
        scope: searchData.scope || "",
        mode: searchData.mode || "abstract",
        results: searchData.results || [],
        createdAt: new Date().toISOString()
      };
      
      searches.unshift(newSearch);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
      return newSearch;
    } catch (error) {
      console.error("Error saving search:", error);
      return null;
    }
  },

  // Delete a saved search
  delete: (id) => {
    try {
      const searches = SavedSearchesService.getAll();
      const filtered = searches.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error("Error deleting search:", error);
      return false;
    }
  },

  // Get a specific search
  getById: (id) => {
    const searches = SavedSearchesService.getAll();
    return searches.find(s => s.id === id);
  },

  // Clear all saved searches
  clearAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("Error clearing searches:", error);
      return false;
    }
  }
};
