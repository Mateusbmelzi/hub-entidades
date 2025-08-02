import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthState } from '@/hooks/useAuthState';

interface AuthStateContextType {
  type: 'student' | 'superAdmin' | null;
  user: any | null;
  isAuthenticated: boolean;
  loginAsSuperAdmin: (email: string) => void;
  loginAsStudent: (user: any) => void;
  logout: () => void;
  updateStudentUser: (user: any) => void;
}

const AuthStateContext = createContext<AuthStateContextType | undefined>(undefined);

export const AuthStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authState = useAuthState();

  return (
    <AuthStateContext.Provider value={authState}>
      {children}
    </AuthStateContext.Provider>
  );
};

export const useAuthStateContext = () => {
  const context = useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error('useAuthStateContext must be used within an AuthStateProvider');
  }
  return context;
}; 