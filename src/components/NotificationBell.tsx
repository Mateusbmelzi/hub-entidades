import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationSystem, Notification } from '@/hooks/useNotificationSystem';
import { toast } from 'sonner';
import { notificationLog } from '@/lib/debug-config';

const NotificationBell = () => {
  const { user, profile } = useAuth();
  const { getNotifications, getUnreadCount, markAsRead, archiveAllNotifications, debugAllNotifications } = useNotificationSystem();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Identificadores possíveis: email e nome
  const notificationKeys = useMemo(() => {
    const keys: string[] = [];
    if (user?.email) keys.push(user.email);
    if (profile?.nome) keys.push(profile.nome);
    return keys.length > 0 ? keys : null;
  }, [user?.email, profile?.nome]);

  const fetchNotifications = async () => {
    console.log('🔔 NotificationBell - Buscando notificações:', { 
      notificationKeys, 
      user: user?.email, 
      profile: profile?.nome,
      userExists: !!user,
      profileExists: !!profile
    });
    setLoading(true);
    try {
      const data = await getNotifications(notificationKeys);
      console.log('🔔 NotificationBell - Notificações encontradas:', { 
        count: data?.length || 0, 
        data: data,
        firstNotification: data?.[0]
      });
      setNotifications(data);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    console.log('🔔 NotificationBell - Buscando contagem:', { notificationKeys });
    try {
      const count = await getUnreadCount(notificationKeys);
      console.log('🔔 NotificationBell - Contagem encontrada:', count);
      setUnreadCount(count);
    } catch (error) {
      console.error('Erro ao buscar contagem de notificações:', error);
    }
  };

  useEffect(() => {
    if (notificationKeys) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [notificationKeys]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      console.log('🔔 NotificationBell - Marcando notificação como lida:', notificationId);
      const success = await markAsRead(notificationId);
      console.log('🔔 NotificationBell - Resultado do markAsRead:', success);
      
      if (success) {
        // Atualizar a lista local
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        // Atualizar contagem
        fetchUnreadCount();
        toast.success('Notificação marcada como lida');
      } else {
        toast.error('Erro ao marcar notificação como lida');
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const promises = unreadNotifications.map(n => markAsRead(n.id));
      await Promise.all(promises);
      
      // Atualizar lista local
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast.error('Erro ao marcar notificações como lidas');
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      console.log('🔔 NotificationBell - Limpando todas as notificações');
      const success = await archiveAllNotifications(notificationKeys);
      
      if (success) {
        // Atualizar lista local - remover todas as notificações
        setNotifications([]);
        setUnreadCount(0);
        toast.success('Todas as notificações foram removidas');
      } else {
        toast.error('Erro ao limpar notificações');
      }
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
      toast.error('Erro ao limpar notificações');
    }
  };

  const handleDebugNotifications = async () => {
    try {
      console.log('🔍 ===== DEBUG SININHO =====');
      console.log('👤 User Email:', user?.email);
      console.log('👤 Profile Nome:', profile?.nome);
      console.log('🔑 Notification Keys:', notificationKeys);
      console.log('---');
      
      await debugAllNotifications();
      
      console.log('🔍 ===== TESTE DE BUSCA =====');
      console.log('🔍 Testando busca com as chaves do sininho...');
      const testData = await getNotifications(notificationKeys);
      console.log('📊 Resultado da busca do sininho:', {
        count: testData?.length || 0,
        data: testData?.map(n => ({
          id: n.id,
          user_email: n.user_email,
          title: n.title,
          archived: n.archived
        }))
      });
      console.log('🔍 ===== FIM DEBUG SININHO =====');
      
      toast.success('Debug executado - verifique o console');
    } catch (error) {
      console.error('Erro no debug:', error);
      toast.error('Erro no debug');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <X className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  if (!user && !profile) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-96 overflow-y-auto" align="end">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Notificações</CardTitle>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleMarkAllAsRead}
                  className="text-xs"
                >
                  Marcar todas como lidas
                </Button>
              )}
              {notifications.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearAllNotifications}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Limpar todas
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDebugNotifications}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Debug
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Carregando...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-4">
              <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 10).map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`border ${getNotificationColor(notification.type)} ${!notification.read ? 'ring-2 ring-primary/20' : ''}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notification.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-6 w-6 p-0 ml-2"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {notifications.length > 10 && (
                <div className="text-center py-2">
                  <p className="text-xs text-muted-foreground">
                    Mostrando as 10 notificações mais recentes
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell; 