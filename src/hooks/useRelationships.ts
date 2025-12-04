import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';

export interface ParentChildRelationship {
  id: string;
  parent_id: string;
  child_id: string;
  child_name: string;
  birth_date: string;
  relationship_type: string;
  is_active: boolean;
  parent_name: string | null;
  parent_email: string | null;
}

export interface TherapistPatientRelationship {
  id: string;
  therapist_id: string;
  patient_id: string;
  access_level: string;
  granted_at: string;
  expires_at: string | null;
  is_active: boolean;
  patient_name: string;
  patient_birth_date: string;
  therapist_name: string;
}

export interface TeacherStudentRelationship {
  id: string;
  teacher_id: string;
  student_id: string;
  class_id: string;
  class_name: string;
  grade_level: string | null;
  is_active: boolean;
  student_name: string;
  teacher_name: string | null;
}

// Hook para gerenciar relacionamentos Pai-Filho
export function useParentChildRelationships() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [children, setChildren] = useState<ParentChildRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChildren = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // Admins veem todos os relacionamentos
      let query = supabase
        .from('children')
        .select(`
          id,
          name,
          birth_date,
          relationship_type,
          is_active,
          parent_id,
          profiles!children_parent_id_fkey (
            full_name,
            email
          )
        `)
        .eq('is_active', true);

      // Se não é admin, filtra pelo parent_id do usuário
      if (!isAdmin) {
        query = query.eq('parent_id', user.id);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      const formatted: ParentChildRelationship[] = (data || []).map((c: any) => ({
        id: c.id,
        parent_id: c.parent_id,
        child_id: c.id,
        child_name: c.name,
        birth_date: c.birth_date,
        relationship_type: c.relationship_type || 'parent',
        is_active: c.is_active,
        parent_name: c.profiles?.full_name || null,
        parent_email: c.profiles?.email || null
      }));

      setChildren(formatted);
    } catch (err) {
      console.error('Error loading children:', err);
      setError('Erro ao carregar filhos vinculados');
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  const addChild = useCallback(async (childData: {
    name: string;
    birth_date: string;
    relationship_type?: string;
  }) => {
    if (!user) return { error: 'Não autenticado' };

    try {
      const { data, error } = await supabase
        .from('children')
        .insert({
          name: childData.name,
          birth_date: childData.birth_date,
          relationship_type: childData.relationship_type || 'parent',
          parent_id: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      await loadChildren();
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }, [user, loadChildren]);

  const removeChild = useCallback(async (childId: string) => {
    try {
      const { error } = await supabase
        .from('children')
        .update({ is_active: false })
        .eq('id', childId);

      if (error) throw error;
      await loadChildren();
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  }, [loadChildren]);

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  return { children, loading, error, refresh: loadChildren, addChild, removeChild };
}

// Hook para gerenciar relacionamentos Terapeuta-Paciente
export function useTherapistPatientRelationships() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [patients, setPatients] = useState<TherapistPatientRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPatients = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('child_access')
        .select(`
          id,
          professional_id,
          child_id,
          access_level,
          granted_at,
          expires_at,
          is_active,
          children (
            name,
            birth_date
          ),
          profiles!child_access_professional_id_fkey (
            full_name
          )
        `)
        .eq('is_active', true);

      // Se não é admin, filtra pelo professional_id do usuário
      if (!isAdmin) {
        query = query.eq('professional_id', user.id);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      const formatted: TherapistPatientRelationship[] = (data || []).map((p: any) => ({
        id: p.id,
        therapist_id: p.professional_id,
        patient_id: p.child_id,
        access_level: p.access_level,
        granted_at: p.granted_at,
        expires_at: p.expires_at,
        is_active: p.is_active,
        patient_name: p.children?.name || 'Paciente',
        patient_birth_date: p.children?.birth_date || '',
        therapist_name: p.profiles?.full_name || ''
      }));

      setPatients(formatted);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('Erro ao carregar pacientes vinculados');
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  const addPatient = useCallback(async (patientData: {
    child_id: string;
    access_level?: string;
  }) => {
    if (!user) return { error: 'Não autenticado' };

    try {
      const { data, error } = await supabase
        .from('child_access')
        .insert({
          professional_id: user.id,
          child_id: patientData.child_id,
          access_level: patientData.access_level || 'read',
          granted_by: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      await loadPatients();
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }, [user, loadPatients]);

  const removePatient = useCallback(async (accessId: string) => {
    try {
      const { error } = await supabase
        .from('child_access')
        .update({ is_active: false })
        .eq('id', accessId);

      if (error) throw error;
      await loadPatients();
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  }, [loadPatients]);

  const updateAccessLevel = useCallback(async (accessId: string, accessLevel: string) => {
    try {
      const { error } = await supabase
        .from('child_access')
        .update({ access_level: accessLevel })
        .eq('id', accessId);

      if (error) throw error;
      await loadPatients();
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  }, [loadPatients]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  return { patients, loading, error, refresh: loadPatients, addPatient, removePatient, updateAccessLevel };
}

// Hook para gerenciar relacionamentos Professor-Aluno
export function useTeacherStudentRelationships() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [students, setStudents] = useState<TeacherStudentRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('class_students')
        .select(`
          id,
          child_id,
          class_id,
          is_active,
          teacher_id,
          school_classes (
            name,
            grade_level,
            teacher_id
          ),
          children (
            name
          )
        `)
        .eq('is_active', true);

      if (queryError) throw queryError;

      // Se não é admin, filtra por turmas do professor
      let filtered = data || [];
      if (!isAdmin) {
        filtered = filtered.filter((s: any) => 
          s.school_classes?.teacher_id === user.id || s.teacher_id === user.id
        );
      }

      const formatted: TeacherStudentRelationship[] = filtered.map((s: any) => ({
        id: s.id,
        teacher_id: s.teacher_id || s.school_classes?.teacher_id,
        student_id: s.child_id,
        class_id: s.class_id,
        class_name: s.school_classes?.name || 'Turma',
        grade_level: s.school_classes?.grade_level,
        is_active: s.is_active,
        student_name: s.children?.name || 'Aluno',
        teacher_name: null
      }));

      setStudents(formatted);
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Erro ao carregar alunos vinculados');
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  const addStudentToClass = useCallback(async (studentData: {
    child_id: string;
    class_id: string;
  }) => {
    if (!user) return { error: 'Não autenticado' };

    try {
      const { data, error } = await supabase
        .from('class_students')
        .insert({
          child_id: studentData.child_id,
          class_id: studentData.class_id,
          teacher_id: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      await loadStudents();
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }, [user, loadStudents]);

  const removeStudentFromClass = useCallback(async (enrollmentId: string) => {
    try {
      const { error } = await supabase
        .from('class_students')
        .update({ is_active: false })
        .eq('id', enrollmentId);

      if (error) throw error;
      await loadStudents();
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  }, [loadStudents]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  return { students, loading, error, refresh: loadStudents, addStudentToClass, removeStudentFromClass };
}

// Hook unificado para verificar acesso a uma criança
export function useChildAccess(childId: string | null) {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [accessType, setAccessType] = useState<'parent' | 'therapist' | 'teacher' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !childId) {
        setHasAccess(false);
        setAccessType(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Check if admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        if (roleData) {
          setHasAccess(true);
          setAccessType('admin');
          setLoading(false);
          return;
        }

        // Check parent access
        const { data: parentData } = await supabase
          .from('children')
          .select('id')
          .eq('id', childId)
          .eq('parent_id', user.id)
          .eq('is_active', true)
          .single();

        if (parentData) {
          setHasAccess(true);
          setAccessType('parent');
          setLoading(false);
          return;
        }

        // Check therapist access
        const { data: therapistData } = await supabase
          .from('child_access')
          .select('id')
          .eq('child_id', childId)
          .eq('professional_id', user.id)
          .eq('is_active', true)
          .single();

        if (therapistData) {
          setHasAccess(true);
          setAccessType('therapist');
          setLoading(false);
          return;
        }

        // Check teacher access
        const { data: teacherData } = await supabase
          .from('class_students')
          .select(`
            id,
            school_classes!inner (
              teacher_id
            )
          `)
          .eq('child_id', childId)
          .eq('is_active', true);

        const hasTeacherAccess = (teacherData || []).some(
          (s: any) => s.school_classes?.teacher_id === user.id
        );

        if (hasTeacherAccess) {
          setHasAccess(true);
          setAccessType('teacher');
          setLoading(false);
          return;
        }

        setHasAccess(false);
        setAccessType(null);
      } catch (err) {
        console.error('Error checking access:', err);
        setHasAccess(false);
        setAccessType(null);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, childId]);

  return { hasAccess, accessType, loading };
}
