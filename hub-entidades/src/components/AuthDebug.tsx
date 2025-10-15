import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStateContext } from '@/components/AuthStateProvider';
import { useUserRole } from '@/hooks/useUserRole';

export const AuthDebug = () => {
  const { user, profile, loading } = useAuth();
  const { type, isAuthenticated } = useAuthStateContext();
  const { userRole, loading: roleLoading } = useUserRole();

  // Verificar localStorage diretamente
  const localStorageDebug = {
    superAdminAuthenticated: localStorage.getItem('superAdminAuthenticated'),
    superAdminEmail: localStorage.getItem('superAdminEmail'),
    supabaseToken: localStorage.getItem('supabase.auth.token'),
    supabaseRefreshToken: localStorage.getItem('supabase.auth.refreshToken'),
    supabaseExpiresAt: localStorage.getItem('supabase.auth.expires_at'),
  };

  // Todas as chaves do localStorage que contêm 'supabase'
  const allSupabaseKeys = Object.keys(localStorage).filter(key => key.includes('supabase'));

  const clearLocalStorage = () => {
    if (confirm('Tem certeza que deseja limpar todo o localStorage? Isso fará logout de todos os usuários.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">🔍 Auth Debug</h3>
      
      <div className="space-y-1">
        <div><strong>Auth State:</strong> {type || 'null'}</div>
        <div><strong>Is Authenticated:</strong> {isAuthenticated ? '✅' : '❌'}</div>
        <div><strong>User Role:</strong> {roleLoading ? '...' : userRole || 'null'}</div>
        <div><strong>Profile Loading:</strong> {loading ? '🔄' : '✅'}</div>
        <div><strong>Profile Completed:</strong> {profile?.profile_completed ? '✅' : '❌'}</div>
        <div><strong>User ID:</strong> {user?.id || 'null'}</div>
        <div><strong>User Email:</strong> {user?.email || 'null'}</div>
      </div>

      <h4 className="font-bold mt-3 mb-1">📦 LocalStorage:</h4>
      <div className="space-y-1">
        <div><strong>Super Admin:</strong> {localStorageDebug.superAdminAuthenticated || 'null'}</div>
        <div><strong>Super Admin Email:</strong> {localStorageDebug.superAdminEmail || 'null'}</div>
        <div><strong>Supabase Token:</strong> {localStorageDebug.supabaseToken ? '✅' : '❌'}</div>
        <div><strong>Refresh Token:</strong> {localStorageDebug.supabaseRefreshToken ? '✅' : '❌'}</div>
        <div><strong>Expires At:</strong> {localStorageDebug.supabaseExpiresAt || 'null'}</div>
      </div>

      <h4 className="font-bold mt-3 mb-1">🔑 Todas as Chaves Supabase:</h4>
      <div className="space-y-1 max-h-20 overflow-y-auto">
        {allSupabaseKeys.length > 0 ? (
          allSupabaseKeys.map(key => (
            <div key={key} className="text-xs">
              <strong>{key}:</strong> {localStorage.getItem(key) ? '✅' : '❌'}
            </div>
          ))
        ) : (
          <div className="text-gray-400">Nenhuma chave Supabase encontrada</div>
        )}
      </div>

      <button 
        onClick={clearLocalStorage}
        className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
      >
        🗑️ Limpar LocalStorage
      </button>

      <div className="mt-3 text-xs text-gray-400">
        Abra o console para ver logs detalhados
      </div>
    </div>
  );
}; 