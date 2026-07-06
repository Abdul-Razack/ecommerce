'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const RecentlyViewedContext = createContext();

export function RecentlyViewedProvider({ children }) {
  const [recentItems, setRecentItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('recentlyViewed');
    if (saved) {
      try {
        setRecentItems(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading recently viewed:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const addRecentlyViewed = (product) => {
    setRecentItems((prev) => {
      const filtered = prev.filter((item) => item._id !== product._id);
      const updated = [product, ...filtered].slice(0, 8); // Keep last 8
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <RecentlyViewedContext.Provider
      value={{
        recentItems,
        addRecentlyViewed,
        isLoaded,
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
}
