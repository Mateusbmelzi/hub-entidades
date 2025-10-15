import React from 'react';
import { useAuthStateContext } from '@/components/AuthStateProvider';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';

export const DebugAuth: React.FC = () => {
  const { type, user: authStateUser, isAuthenticated } = useAuthStateContext();
  const { user, profile } = useAuth();
  const { userRole, isAdmin, loading, error } = useUserRole();

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded-lg z-50 max-w-md text-xs">
      <h3 className="font-bold mb-2">Debug Auth State</h3>
      <div className="space-y-1">
        <div><strong>AuthState Type:</strong> {type || 'null'}</div>
        <div><strong>AuthState User:</strong> {authStateUser?.email || 'null'}</div>
        <div><strong>AuthState Authenticated:</strong> {isAuthenticated ? 'true' : 'false'}</div>
        <div><strong>Supabase User:</strong> {user?.email || 'null'}</div>
        <div><strong>Profile:</strong> {profile?.email || 'null'}</div>
        <div><strong>User Role:</strong> {userRole || 'null'}</div>
        <div><strong>Is Admin:</strong> {isAdmin ? 'true' : 'false'}</div>
        <div><strong>Loading:</strong> {loading ? 'true' : 'false'}</div>
        <div><strong>Error:</strong> {error || 'none'}</div>
        <div><strong>Is Authorized:</strong> {(type === 'superAdmin' || isAdmin) ? 'true' : 'false'}</div>
      </div>
    </div>
  );
};
