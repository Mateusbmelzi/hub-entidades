import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RedirectDestinationContextType {
  destination: string | null;
  setDestination: (destination: string | null) => void;
  clearDestination: () => void;
}

const RedirectDestinationContext = createContext<RedirectDestinationContextType | undefined>(undefined);

export function RedirectDestinationProvider({ children }: { children: ReactNode }) {
  const [destination, setDestinationState] = useState<string | null>(null);

  const setDestination = (dest: string | null) => {
    setDestinationState(dest);
  };

  const clearDestination = () => {
    setDestinationState(null);
  };

  return (
    <RedirectDestinationContext.Provider value={{
      destination,
      setDestination,
      clearDestination
    }}>
      {children}
    </RedirectDestinationContext.Provider>
  );
}

export function useRedirectDestination() {
  const context = useContext(RedirectDestinationContext);
  if (context === undefined) {
    throw new Error('useRedirectDestination must be used within a RedirectDestinationProvider');
  }
  return context;
} 