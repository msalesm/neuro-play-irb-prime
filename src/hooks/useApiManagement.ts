import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  permissions: string[] | null;
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  last_status: number | null;
  created_at: string;
}

interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  response_status: number | null;
  attempt_number: number;
  delivered_at: string | null;
  error_message: string | null;
  created_at: string;
}

interface Integration {
  id: string;
  provider: string;
  integration_type: string | null;
  is_active: boolean;
  last_sync_at: string | null;
  sync_status: string | null;
  error_message: string | null;
  created_at: string;
}

interface ApiUsageLog {
  id: string;
  endpoint: string;
  method: string;
  status_code: number | null;
  response_time_ms: number | null;
  created_at: string;
}

export function useApiManagement() {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [webhookDeliveries, setWebhookDeliveries] = useState<WebhookDelivery[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [usageLogs, setUsageLogs] = useState<ApiUsageLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [keysRes, webhooksRes, deliveriesRes, integrationsRes, logsRes] = await Promise.all([
        supabase.from('api_keys').select('*').order('created_at', { ascending: false }),
        supabase.from('webhook_configurations').select('*').order('created_at', { ascending: false }),
        supabase.from('webhook_deliveries').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('external_integrations').select('*').order('created_at', { ascending: false }),
        supabase.from('api_usage_logs').select('*').order('created_at', { ascending: false }).limit(100)
      ]);

      if (keysRes.data) setApiKeys(keysRes.data as ApiKey[]);
      if (webhooksRes.data) setWebhooks(webhooksRes.data as Webhook[]);
      if (deliveriesRes.data) setWebhookDeliveries(deliveriesRes.data as WebhookDelivery[]);
      if (integrationsRes.data) setIntegrations(integrationsRes.data as Integration[]);
      if (logsRes.data) setUsageLogs(logsRes.data as ApiUsageLog[]);
    } catch (error) {
      console.error('Error fetching API data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async (name: string, permissions: string[], expiresAt?: Date) => {
    if (!user) return null;

    try {
      // Generate key using RPC
      const { data: keyValue, error: genError } = await supabase.rpc('generate_api_key');
      if (genError) throw genError;

      const keyPrefix = keyValue.substring(0, 10);
      // In production, hash the key before storing
      const keyHash = keyValue; // Simplified - should use proper hashing

      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          name,
          key_prefix: keyPrefix,
          key_hash: keyHash,
          permissions,
          expires_at: expiresAt?.toISOString() || null,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Chave API criada com sucesso');
      await fetchData();
      
      // Return the full key (only shown once)
      return keyValue;
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Erro ao criar chave API');
      return null;
    }
  };

  const revokeApiKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', keyId);

      if (error) throw error;

      toast.success('Chave API revogada');
      await fetchData();
    } catch (error) {
      console.error('Error revoking API key:', error);
      toast.error('Erro ao revogar chave API');
    }
  };

  const createWebhook = async (name: string, url: string, events: string[]) => {
    if (!user) return null;

    try {
      // Generate webhook secret
      const secret = 'whsec_' + crypto.randomUUID().replace(/-/g, '');

      const { data, error } = await supabase
        .from('webhook_configurations')
        .insert({
          user_id: user.id,
          name,
          url,
          secret,
          events,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Webhook criado com sucesso');
      await fetchData();
      return { ...data, secret };
    } catch (error) {
      console.error('Error creating webhook:', error);
      toast.error('Erro ao criar webhook');
      return null;
    }
  };

  const updateWebhook = async (webhookId: string, updates: Partial<Webhook>) => {
    try {
      const { error } = await supabase
        .from('webhook_configurations')
        .update(updates)
        .eq('id', webhookId);

      if (error) throw error;

      toast.success('Webhook atualizado');
      await fetchData();
    } catch (error) {
      console.error('Error updating webhook:', error);
      toast.error('Erro ao atualizar webhook');
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    try {
      const { error } = await supabase
        .from('webhook_configurations')
        .delete()
        .eq('id', webhookId);

      if (error) throw error;

      toast.success('Webhook excluído');
      await fetchData();
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast.error('Erro ao excluir webhook');
    }
  };

  return {
    apiKeys,
    webhooks,
    webhookDeliveries,
    integrations,
    usageLogs,
    loading,
    createApiKey,
    revokeApiKey,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    refetch: fetchData
  };
}
