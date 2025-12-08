import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface WearableConnection {
  id: string;
  user_id: string;
  child_id?: string;
  provider: 'apple_watch' | 'fitbit' | 'amazfit' | 'garmin';
  device_id?: string;
  is_active: boolean;
  last_sync_at?: string;
  created_at: string;
}

export interface BiofeedbackReading {
  id: string;
  child_id: string;
  reading_type: 'heart_rate' | 'hrv' | 'sleep' | 'movement' | 'stress';
  value: number;
  unit: string;
  recorded_at: string;
}

export interface BiofeedbackAlert {
  id: string;
  child_id: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'urgent';
  message: string;
  recommendation?: string;
  is_acknowledged: boolean;
  created_at: string;
}

export function useWearables(childId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<WearableConnection[]>([]);
  const [readings, setReadings] = useState<BiofeedbackReading[]>([]);
  const [alerts, setAlerts] = useState<BiofeedbackAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConnections = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wearable_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setConnections((data || []) as WearableConnection[]);
    } catch (error) {
      console.error('Error loading wearable connections:', error);
    }
  }, [user]);

  const loadReadings = useCallback(async () => {
    if (!childId) return;

    try {
      const { data, error } = await supabase
        .from('biofeedback_readings')
        .select('*')
        .eq('child_id', childId)
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setReadings((data || []) as BiofeedbackReading[]);
    } catch (error) {
      console.error('Error loading biofeedback readings:', error);
    }
  }, [childId]);

  const loadAlerts = useCallback(async () => {
    if (!childId) return;

    try {
      const { data, error } = await supabase
        .from('biofeedback_alerts')
        .select('*')
        .eq('child_id', childId)
        .eq('is_acknowledged', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts((data || []) as BiofeedbackAlert[]);
    } catch (error) {
      console.error('Error loading biofeedback alerts:', error);
    }
  }, [childId]);

  const connectDevice = useCallback(async (provider: WearableConnection['provider'], deviceId?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('wearable_connections')
        .insert({
          user_id: user.id,
          child_id: childId,
          provider,
          device_id: deviceId,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Dispositivo conectado',
        description: `${provider} foi conectado com sucesso`
      });

      await loadConnections();
      return data as WearableConnection;
    } catch (error) {
      console.error('Error connecting device:', error);
      toast({
        title: 'Erro ao conectar',
        description: 'Não foi possível conectar o dispositivo',
        variant: 'destructive'
      });
      return null;
    }
  }, [user, childId, toast, loadConnections]);

  const disconnectDevice = useCallback(async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('wearable_connections')
        .update({ is_active: false })
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: 'Dispositivo desconectado',
        description: 'O dispositivo foi desconectado'
      });

      await loadConnections();
    } catch (error) {
      console.error('Error disconnecting device:', error);
    }
  }, [toast, loadConnections]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('biofeedback_alerts')
        .update({ 
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;
      await loadAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  }, [loadAlerts]);

  // Simulate biofeedback reading (placeholder for real integration)
  const simulateReading = useCallback(async (type: BiofeedbackReading['reading_type'], value: number, unit: string) => {
    if (!childId) return;

    try {
      const { error } = await supabase
        .from('biofeedback_readings')
        .insert({
          child_id: childId,
          reading_type: type,
          value,
          unit,
          recorded_at: new Date().toISOString()
        });

      if (error) throw error;
      await loadReadings();
    } catch (error) {
      console.error('Error simulating reading:', error);
    }
  }, [childId, loadReadings]);

  const getLatestReading = useCallback((type: BiofeedbackReading['reading_type']) => {
    return readings.find(r => r.reading_type === type);
  }, [readings]);

  const getAverageReading = useCallback((type: BiofeedbackReading['reading_type'], hours = 24) => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const filtered = readings.filter(r => r.reading_type === type && r.recorded_at >= cutoff);
    if (filtered.length === 0) return null;
    return filtered.reduce((sum, r) => sum + r.value, 0) / filtered.length;
  }, [readings]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadConnections(), loadReadings(), loadAlerts()])
      .finally(() => setLoading(false));
  }, [loadConnections, loadReadings, loadAlerts]);

  return {
    connections,
    readings,
    alerts,
    loading,
    connectDevice,
    disconnectDevice,
    acknowledgeAlert,
    simulateReading,
    getLatestReading,
    getAverageReading,
    reload: () => Promise.all([loadConnections(), loadReadings(), loadAlerts()])
  };
}
