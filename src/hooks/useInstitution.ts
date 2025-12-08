import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Institution {
  id: string;
  name: string;
  type: string;
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  max_users: number;
  updated_at: string;
  is_active: boolean;
  settings: Record<string, any> | null;
  created_at: string;
}

export interface InstitutionMember {
  id: string;
  user_id: string;
  institution_id: string;
  role: string;
  department: string | null;
  is_active: boolean;
  joined_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
  };
}

export interface InstitutionStats {
  totalMembers: number;
  therapists: number;
  teachers: number;
  students: number;
  activeSessions: number;
  completedStories: number;
}

export function useInstitution() {
  const { user } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [members, setMembers] = useState<InstitutionMember[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<InstitutionStats>({
    totalMembers: 0,
    therapists: 0,
    teachers: 0,
    students: 0,
    activeSessions: 0,
    completedStories: 0
  });

  const loadInstitution = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user's institution membership
      const { data: membership, error: memberError } = await supabase
        .from('institution_members')
        .select('institution_id, role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (memberError) throw memberError;
      if (!membership) {
        setLoading(false);
        return;
      }

      setUserRole(membership.role);

      // Get institution details
      const { data: inst, error: instError } = await supabase
        .from('institutions')
        .select('*')
        .eq('id', membership.institution_id)
        .single();

      if (instError) throw instError;
      setInstitution({
        ...inst,
        settings: typeof inst.settings === 'object' ? inst.settings as Record<string, any> : null
      });

      // Load all members
      const { data: membersData, error: membersError } = await supabase
        .from('institution_members')
        .select('*')
        .eq('institution_id', membership.institution_id)
        .eq('is_active', true);

      if (membersError) throw membersError;

      // Get profiles for members
      const memberIds = membersData?.map(m => m.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', memberIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const enrichedMembers = (membersData || []).map(m => ({
        ...m,
        profile: profileMap.get(m.user_id) || null
      }));

      setMembers(enrichedMembers);

      // Calculate stats
      const therapistCount = enrichedMembers.filter(m => m.role === 'therapist').length;
      const teacherCount = enrichedMembers.filter(m => m.role === 'teacher').length;

      // Get student count from classes
      const { data: classesData } = await supabase
        .from('school_classes')
        .select('id')
        .eq('school_id', membership.institution_id);

      let studentCount = 0;
      if (classesData && classesData.length > 0) {
        const { count } = await supabase
          .from('class_students')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classesData.map(c => c.id))
          .eq('is_active', true);
        studentCount = count || 0;
      }

      setStats({
        totalMembers: enrichedMembers.length,
        therapists: therapistCount,
        teachers: teacherCount,
        students: studentCount,
        activeSessions: 0,
        completedStories: 0
      });

    } catch (error) {
      console.error('Error loading institution:', error);
      toast.error('Erro ao carregar dados da instituição');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadInstitution();
  }, [loadInstitution]);

  const inviteMember = async (email: string, role: string, department?: string) => {
    if (!institution || !user) return null;

    try {
      const inviteCode = crypto.randomUUID().slice(0, 8).toUpperCase();
      
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          inviter_id: user.id,
          invite_type: 'institution_member',
          invite_code: inviteCode,
          status: 'pending',
          child_name: email,
          child_conditions: { 
            role, 
            department,
            institution_id: institution.id 
          }
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Convite gerado! Código: ${inviteCode}`);
      return { ...data, invite_code: inviteCode };
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error('Erro ao enviar convite');
      return null;
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('institution_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      setMembers(prev => prev.map(m => 
        m.id === memberId ? { ...m, role: newRole } : m
      ));

      toast.success('Função atualizada com sucesso');
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Erro ao atualizar função');
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('institution_members')
        .update({ is_active: false })
        .eq('id', memberId);

      if (error) throw error;

      setMembers(prev => prev.filter(m => m.id !== memberId));
      toast.success('Membro removido com sucesso');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Erro ao remover membro');
    }
  };

  const isAdmin = userRole === 'admin';
  const isCoordinator = userRole === 'coordinator' || isAdmin;

  return {
    institution,
    members,
    userRole,
    stats,
    loading,
    isAdmin,
    isCoordinator,
    inviteMember,
    updateMemberRole,
    removeMember,
    reload: loadInstitution
  };
}
