import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function AdminNavLink() {
  const { user } = useAuth();
  const [isEducator, setIsEducator] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (user) {
      checkEducatorRole();
      fetchNotifications();
    }
  }, [user]);

  const checkEducatorRole = async () => {
    if (!user) return;

    try {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (roles) {
        const userRoles = roles.map(r => r.role);
        setIsEducator(userRoles.includes('admin') || userRoles.includes('educator'));
      }
    } catch (error) {
      console.error('Error checking educator role:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('id')
        .eq('user_id', user.id)
        .is('read_at', null);

      if (error) throw error;
      setUnreadNotifications(data?.length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  if (!isEducator) return null;

  return (
    <Button variant="outline" asChild className="relative">
      <Link to="/admin" className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <span className="hidden sm:inline">Painel Admin</span>
        {unreadNotifications > 0 && (
          <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs min-w-[1.2rem] h-5">
            {unreadNotifications}
          </Badge>
        )}
      </Link>
    </Button>
  );
}