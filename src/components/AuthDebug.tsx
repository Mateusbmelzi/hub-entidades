import React from 'react';
import { useAuthStateContext } from './AuthStateProvider';

export const AuthDebug: React.FC = () => {
  const { type, user, isAuthenticated } = useAuthStateContext();

  console.log(user);
  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded-lg text-xs z-50">
      <div className="font-bold mb-2">🔍 Auth Debug</div>
      <div>Type: {type || 'null'}</div>
      <div>Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
      <div>User: {user ? JSON.stringify(user) : 'null'}</div>
      <div>LocalStorage:</div>
      <div>superAdmin: {localStorage.getItem('superAdminAuthenticated')}</div>
      <div>token: {localStorage.getItem('supabase.auth.token') ? 'exists' : 'null'}</div>
    </div>
  );
}; 