import React, { createContext, useContext, useEffect, useState } from 'react';

interface PageTrackingContextType {
  sessionId: string;
  trackPageVisit: (pageUrl: string, entityId?: string) => Promise<void>;
  logPageView: (pageName: string, metadata?: any) => void;
  logSearchActivity: (searchTerm: string, searchType?: string, resultsCount?: number) => Promise<void>;
  logInterestDemonstration: (entidadeId: number, estudanteEmail: string, areaInteresse?: string) => Promise<void>;
}

const PageTrackingContext = createContext<PageTrackingContextType | undefined>(undefined);

export const usePageTrackingContext = () => {
  const context = useContext(PageTrackingContext);
  if (!context) {
    throw new Error('usePageTrackingContext must be used within a PageTrackingProvider');
  }
  return context;
};

interface PageTrackingProviderProps {
  children: React.ReactNode;
}

export const PageTrackingProvider: React.FC<PageTrackingProviderProps> = ({ children }) => {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Simplified tracking functions that don't make RPC calls
  const trackPageVisit = async (pageUrl: string, entityId?: string) => {
    try {
      console.log('Page visit tracked:', { pageUrl, entityId, sessionId });
      // TODO: Implement actual tracking when database is ready
    } catch (error) {
      console.error('Error tracking page visit:', error);
    }
  };

  const logSearchActivity = async (searchTerm: string, searchType?: string, resultsCount?: number) => {
    try {
      console.log('Search activity logged:', { searchTerm, searchType, resultsCount, sessionId });
      // TODO: Implement actual search logging when database is ready
    } catch (error) {
      console.error('Error logging search activity:', error);
    }
  };

  const logPageView = (pageName: string, metadata?: any) => {
    try {
      console.log('Page view logged:', { pageName, metadata, sessionId });
      // TODO: Implement actual page view logging when database is ready
    } catch (error) {
      console.error('Error logging page view:', error);
    }
  };

  const logInterestDemonstration = async (entidadeId: number, estudanteEmail: string, areaInteresse?: string) => {
    try {
      console.log('Interest demonstration logged:', { entidadeId, estudanteEmail, areaInteresse, sessionId });
      // TODO: Implement actual interest logging when database is ready
    } catch (error) {
      console.error('Error logging interest demonstration:', error);
    }
  };

  const contextValue: PageTrackingContextType = {
    sessionId,
    trackPageVisit,
    logPageView,
    logSearchActivity,
    logInterestDemonstration
  };

  return (
    <PageTrackingContext.Provider value={contextValue}>
      {children}
    </PageTrackingContext.Provider>
  );
}; 