import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useActivityLogger } from './useActivityLogger';
import { useAuth } from './useAuth';

export const usePageTracking = () => {
  const location = useLocation();
  const { logPageVisit, logEntityPageVisit, generateSessionId, getCurrentPageUrl, getReferrer } = useActivityLogger();
  const { user } = useAuth();
  const sessionIdRef = useRef<string>('');
  const lastPageRef = useRef<string>('');

  // Initialize session on mount
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = generateSessionId();
    }
  }, [generateSessionId]);

  // Track page visits
  const trackPageVisit = useCallback(async (pageUrl: string, entityId?: string) => {
    if (!user) return; // Only track for authenticated users

    try {
      const referrer = getReferrer();
      
      if (entityId) {
        // Track entity page visit specifically
        await logEntityPageVisit(parseInt(entityId), sessionIdRef.current, referrer);
      } else {
        // Track general page visit
        await logPageVisit({
          pageUrl,
          sessionId: sessionIdRef.current,
          referrer,
          metadata: {
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            language: navigator.language
          }
        });
      }
    } catch (error) {
      console.error('Erro ao rastrear visita de página:', error);
    }
  }, [user, logPageVisit, logEntityPageVisit, getReferrer]);

  // Track page changes
  useEffect(() => {
    const currentPage = getCurrentPageUrl();
    
    // Don't track if it's the same page or if user is not authenticated
    if (currentPage === lastPageRef.current || !user) {
      lastPageRef.current = currentPage;
      return;
    }

    // Extract entity ID from URL if it's an entity page
    const entityMatch = currentPage.match(/\/entidades\/(\d+)/);
    const entityId = entityMatch ? entityMatch[1] : undefined;

    trackPageVisit(currentPage, entityId);
    lastPageRef.current = currentPage;
  }, [location, user, trackPageVisit, getCurrentPageUrl]);

  // Track when user becomes authenticated
  useEffect(() => {
    if (user && lastPageRef.current) {
      // Track the current page when user logs in
      const currentPage = getCurrentPageUrl();
      const entityMatch = currentPage.match(/\/entidades\/(\d+)/);
      const entityId = entityMatch ? entityMatch[1] : undefined;
      
      trackPageVisit(currentPage, entityId);
    }
  }, [user, trackPageVisit, getCurrentPageUrl]);

  return {
    sessionId: sessionIdRef.current,
    trackPageVisit
  };
}; 