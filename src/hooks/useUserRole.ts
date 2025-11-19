import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'admin' | 'therapist' | 'parent' | 'user';

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) throw error;

        const userRoles = (data || []).map(r => r.role as AppRole);
        setRoles(userRoles);

        // Set primary role (highest privilege)
        const roleHierarchy: AppRole[] = ['admin', 'therapist', 'parent', 'user'];
        const primaryRole = roleHierarchy.find(r => userRoles.includes(r)) || null;
        setRole(primaryRole);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRole(null);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user]);

  const hasRole = (checkRole: AppRole): boolean => {
    return roles.includes(checkRole);
  };

  const isAdmin = hasRole('admin');
  const isTherapist = hasRole('therapist');
  const isParent = hasRole('parent');

  return {
    role,
    roles,
    loading,
    hasRole,
    isAdmin,
    isTherapist,
    isParent,
  };
}
