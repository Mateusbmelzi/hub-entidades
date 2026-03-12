import React, { createContext, useContext, useCallback, useState } from 'react';
import { useActivityLogger } from '@/hooks/useActivityLogger';

interface PageTrackingContextType {
  sessionId: string;
  trackPageVisit: (pageUrl: string, entityId?: string) => Promise<void>;
  logPageView: (pageName: string, metadata?: Record<string, unknown>) => void;
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
  const [sessionId] = useState(
    () => `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  );

  const {
    logPageVisit,
    logEntityPageVisit,
    logSearchActivity: logSearch,
    logInterestDemonstration: logInterest,
    getReferrer
  } = useActivityLogger();

  const trackPageVisit = useCallback(
    async (pageUrl: string, entityId?: string) => {
      try {
        const referrer = getReferrer();
        const metadata: Record<string, unknown> = {
          userAgent: navigator.userAgent,
          screenResolution: `${screen.width}x${screen.height}`,
          language: navigator.language
        };
        if (entityId) {
          await logEntityPageVisit(parseInt(entityId, 10), sessionId, referrer ?? undefined);
        } else {
          await logPageVisit({
            pageUrl,
            sessionId,
            referrer: referrer ?? undefined,
            metadata
          });
        }
      } catch (error) {
        console.error('Error tracking page visit:', error);
      }
    },
    [sessionId, logPageVisit, logEntityPageVisit, getReferrer]
  );

  const logPageView = useCallback(
    (pageName: string, metadata?: Record<string, unknown>) => {
      const url = typeof window !== 'undefined' ? window.location.pathname + window.location.search : pageName;
      trackPageVisit(url, undefined);
    },
    [trackPageVisit]
  );

  const logSearchActivity = useCallback(
    async (searchTerm: string, searchType?: string, resultsCount?: number) => {
      try {
        await logSearch({
          searchTerm,
          searchType,
          resultsCount,
          sessionId
        });
      } catch (error) {
        console.error('Error logging search activity:', error);
      }
    },
    [sessionId, logSearch]
  );

  const logInterestDemonstration = useCallback(
    async (entidadeId: number, estudanteEmail: string, areaInteresse?: string) => {
      try {
        await logInterest({
          entidadeId,
          estudanteEmail,
          areaInteresse,
          sessionId
        });
      } catch (error) {
        console.error('Error logging interest demonstration:', error);
      }
    },
    [sessionId, logInterest]
  );

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
