import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  institution_id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  due_date: string;
  paid_at: string | null;
  billing_period_start: string;
  billing_period_end: string;
  line_items: any[];
  created_at: string;
}

interface Contract {
  id: string;
  institution_id: string;
  contract_number: string;
  contract_type: string;
  status: string;
  start_date: string;
  end_date: string | null;
  value_monthly: number | null;
  value_total: number | null;
  auto_renew: boolean;
  signed_at: string | null;
  created_at: string;
}

export function useBillingContracts(institutionId?: string) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInvoices = useCallback(async () => {
    if (!institutionId) return;
    
    const { data } = await supabase
      .from('invoices')
      .select('*')
      .eq('institution_id', institutionId)
      .order('due_date', { ascending: false });
    
    setInvoices((data || []) as Invoice[]);
  }, [institutionId]);

  const loadContracts = useCallback(async () => {
    if (!institutionId) return;
    
    const { data } = await supabase
      .from('contracts')
      .select('*')
      .eq('institution_id', institutionId)
      .order('created_at', { ascending: false });
    
    setContracts((data || []) as Contract[]);
  }, [institutionId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadInvoices(), loadContracts()]);
      setLoading(false);
    };
    load();
  }, [loadInvoices, loadContracts]);

  const markInvoicePaid = async (invoiceId: string, paymentMethod: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: 'paid', 
          paid_at: new Date().toISOString(),
          payment_method: paymentMethod 
        })
        .eq('id', invoiceId);

      if (error) throw error;
      toast.success('Fatura marcada como paga');
      loadInvoices();
    } catch (error) {
      toast.error('Erro ao atualizar fatura');
    }
  };

  const signContract = async (contractId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('contracts')
        .update({ 
          status: 'active', 
          signed_at: new Date().toISOString(),
          signed_by: user?.id 
        })
        .eq('id', contractId);

      if (error) throw error;
      toast.success('Contrato assinado com sucesso');
      loadContracts();
    } catch (error) {
      toast.error('Erro ao assinar contrato');
    }
  };

  const cancelContract = async (contractId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('contracts')
        .update({ 
          status: 'cancelled', 
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason 
        })
        .eq('id', contractId);

      if (error) throw error;
      toast.success('Contrato cancelado');
      loadContracts();
    } catch (error) {
      toast.error('Erro ao cancelar contrato');
    }
  };

  const stats = {
    totalPending: invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0),
    totalOverdue: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0),
    activeContracts: contracts.filter(c => c.status === 'active').length,
    monthlyRecurring: contracts.filter(c => c.status === 'active').reduce((sum, c) => sum + (c.value_monthly || 0), 0)
  };

  return {
    invoices,
    contracts,
    loading,
    stats,
    markInvoicePaid,
    signContract,
    cancelContract,
    refresh: () => Promise.all([loadInvoices(), loadContracts()])
  };
}
