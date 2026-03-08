/**
 * Security Service
 * 
 * Centralized security operations: audit logging, consent tracking,
 * data access logging, and rate limit checks.
 */

import { supabase } from '@/integrations/supabase/client';

// ─── Audit Logging ────────────────────────────────────────

export async function logAuditEvent(
  action: string,
  resourceType: string,
  resourceId?: string,
) {
  const { error } = await supabase.rpc('log_audit_event', {
    p_action: action,
    p_resource_type: resourceType,
    p_resource_id: resourceId ?? null,
    p_user_agent: navigator.userAgent,
  });
  if (error) console.error('[Audit] Failed to log:', error);
}

// ─── Clinical Audit ───────────────────────────────────────

export async function logClinicalAudit(
  actionType: string,
  resourceType: string,
  opts?: { resourceId?: string; childId?: string; details?: Record<string, unknown> },
) {
  const { error } = await supabase.rpc('log_clinical_audit', {
    p_action_type: actionType,
    p_resource_type: resourceType,
    p_resource_id: opts?.resourceId ?? null,
    p_child_id: opts?.childId ?? null,
    p_action_details: opts?.details ?? {},
    p_user_agent: navigator.userAgent,
  });
  if (error) console.error('[ClinicalAudit] Failed to log:', error);
}

// ─── Data Access Logging ──────────────────────────────────

export async function logDataAccess(
  opts: {
    accessedUserId?: string;
    accessedChildId?: string;
    dataCategory?: string;
    accessType?: string;
    reason?: string;
  },
) {
  const { error } = await supabase.rpc('log_data_access', {
    p_accessed_user_id: opts.accessedUserId ?? null,
    p_accessed_child_id: opts.accessedChildId ?? null,
    p_data_category: opts.dataCategory ?? 'general',
    p_access_type: opts.accessType ?? 'view',
    p_access_reason: opts.reason ?? null,
    p_user_agent: navigator.userAgent,
  });
  if (error) console.error('[DataAccess] Failed to log:', error);
}

// ─── Consent Checking ────────────────────────────────────

export async function checkRequiredConsents(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_required_consents', {
    p_user_id: userId,
  });
  if (error) {
    console.error('[Consent] Check failed:', error);
    return false;
  }
  return data === true;
}

// ─── Consent Recording ──────────────────────────────────

export async function recordConsent(documentId: string, given: boolean) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const { error } = await supabase
    .from('user_consents')
    .insert({
      user_id: user.id,
      document_id: documentId,
      consent_given: given,
      ip_address: '0.0.0.0', // captured server-side ideally
    });
  if (error) throw error;
}
