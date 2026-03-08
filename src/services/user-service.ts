/**
 * User Service
 * 
 * Centralizes all user and profile data access operations.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

// ============ PROFILES ============

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Record<string, any>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============ ROLES ============

export async function fetchUserRoles(userId: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map(r => r.role);
}

export async function assignUserRole(userId: string, role: AppRole) {
  const { error } = await supabase.rpc('assign_role', {
    _user_id: userId,
    _role: role,
  });
  if (error) throw error;
}

// ============ CHILDREN ============

export async function fetchChildren(userId: string) {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', userId)
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function fetchChildById(childId: string) {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .single();
  if (error) throw error;
  return data;
}

export async function createChild(child: {
  name: string;
  birth_date: string;
  parent_id: string;
}) {
  const { data, error } = await supabase
    .from('children')
    .insert([child])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============ CHILD ACCESS ============

export async function fetchChildAccess(childId: string) {
  const { data, error } = await supabase
    .from('child_access')
    .select('*, profiles!child_access_professional_id_fkey(full_name, email)')
    .eq('child_id', childId)
    .eq('is_active', true);
  if (error) throw error;
  return data || [];
}

export async function requestChildAccess(params: {
  childId: string;
  professionalId: string;
  accessLevel: string;
  grantedBy: string;
}) {
  const { data, error } = await supabase
    .from('child_access')
    .insert([{
      child_id: params.childId,
      professional_id: params.professionalId,
      access_level: params.accessLevel,
      granted_by: params.grantedBy,
      approval_status: 'pending',
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============ FAMILY LINKS ============

export async function fetchFamilyLinks(parentUserId: string) {
  const { data, error } = await supabase
    .from('family_links')
    .select('*')
    .eq('parent_user_id', parentUserId)
    .eq('status', 'accepted');
  if (error) throw error;
  return data || [];
}
