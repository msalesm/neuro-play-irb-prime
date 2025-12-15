import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface RetentionPolicy {
  id: string;
  data_type: string;
  retention_days: number;
  anonymize_after_days: number | null;
  description: string | null;
  is_active: boolean;
}

interface ExportRequest {
  id: string;
  user_id: string;
  request_type: 'full_export' | 'partial_export' | 'child_data';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  child_id: string | null;
  export_url: string | null;
  expires_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  created_at: string;
}

interface DeletionRequest {
  id: string;
  user_id: string;
  request_type: 'full_account' | 'child_data' | 'specific_data';
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
  child_id: string | null;
  data_categories: string[] | null;
  reason: string | null;
  approved_by: string | null;
  approved_at: string | null;
  completed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

interface AccessLog {
  id: string;
  user_id: string;
  accessed_user_id: string | null;
  accessed_child_id: string | null;
  data_category: string;
  access_type: 'view' | 'export' | 'modify' | 'delete';
  access_reason: string | null;
  created_at: string;
}

export function useDataGovernance() {
  const { user } = useAuth();
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>([]);
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [policiesRes, exportsRes, deletionsRes, logsRes] = await Promise.all([
        supabase.from('data_retention_policies').select('*').order('data_type'),
        supabase.from('data_export_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('data_deletion_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('data_access_logs').select('*').order('created_at', { ascending: false }).limit(100)
      ]);

      if (policiesRes.data) setRetentionPolicies(policiesRes.data as RetentionPolicy[]);
      if (exportsRes.data) setExportRequests(exportsRes.data as ExportRequest[]);
      if (deletionsRes.data) setDeletionRequests(deletionsRes.data as DeletionRequest[]);
      if (logsRes.data) setAccessLogs(logsRes.data as AccessLog[]);
    } catch (error) {
      console.error('Error fetching data governance:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestDataExport = async (requestType: 'full_export' | 'partial_export' | 'child_data', childId?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('data_export_requests')
        .insert({
          user_id: user.id,
          request_type: requestType,
          child_id: childId || null,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Solicitação de exportação criada com sucesso');
      await fetchData();
      return data;
    } catch (error) {
      console.error('Error requesting export:', error);
      toast.error('Erro ao solicitar exportação de dados');
      return null;
    }
  };

  const requestDataDeletion = async (
    requestType: 'full_account' | 'child_data' | 'specific_data',
    reason: string,
    childId?: string,
    dataCategories?: string[]
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('data_deletion_requests')
        .insert({
          user_id: user.id,
          request_type: requestType,
          reason,
          child_id: childId || null,
          data_categories: dataCategories || null,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Solicitação de exclusão criada com sucesso');
      await fetchData();
      return data;
    } catch (error) {
      console.error('Error requesting deletion:', error);
      toast.error('Erro ao solicitar exclusão de dados');
      return null;
    }
  };

  const logDataAccess = async (
    accessedUserId: string | null,
    accessedChildId: string | null,
    dataCategory: string,
    accessType: 'view' | 'export' | 'modify' | 'delete',
    accessReason?: string
  ) => {
    try {
      const { error } = await supabase.rpc('log_data_access', {
        p_accessed_user_id: accessedUserId,
        p_accessed_child_id: accessedChildId,
        p_data_category: dataCategory,
        p_access_type: accessType,
        p_access_reason: accessReason || null,
        p_user_agent: navigator.userAgent
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging data access:', error);
    }
  };

  return {
    retentionPolicies,
    exportRequests,
    deletionRequests,
    accessLogs,
    loading,
    requestDataExport,
    requestDataDeletion,
    logDataAccess,
    refetch: fetchData
  };
}
