import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface LegalDocument {
  id: string;
  document_type: string;
  version: string;
  title: string;
  content: string;
  summary: string | null;
  is_active: boolean;
  published_at: string | null;
}

interface UserConsent {
  id: string;
  user_id: string;
  child_id: string | null;
  document_id: string;
  consent_given: boolean;
  consent_method: string;
  consented_at: string;
  revoked_at: string | null;
  revocation_reason: string | null;
  legal_documents?: LegalDocument;
}

export function useConsents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [consents, setConsents] = useState<UserConsent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load active legal documents
      const { data: docs, error: docsError } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('is_active', true)
        .order('document_type');

      if (docsError) throw docsError;
      setDocuments(docs || []);

      // Load user consents
      const { data: userConsents, error: consentsError } = await supabase
        .from('user_consents')
        .select(`
          *,
          legal_documents (*)
        `)
        .eq('user_id', user.id)
        .is('revoked_at', null);

      if (consentsError) throw consentsError;
      setConsents(userConsents || []);
    } catch (error) {
      console.error('Error loading consents:', error);
      toast.error('Erro ao carregar consentimentos');
    } finally {
      setLoading(false);
    }
  };

  const giveConsent = async (documentId: string, childId?: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_consents')
        .insert({
          user_id: user.id,
          document_id: documentId,
          child_id: childId || null,
          consent_given: true,
          consent_method: 'checkbox',
          user_agent: navigator.userAgent
        });

      if (error) throw error;
      
      await loadData();
      toast.success('Consentimento registrado');
      return true;
    } catch (error) {
      console.error('Error giving consent:', error);
      toast.error('Erro ao registrar consentimento');
      return false;
    }
  };

  const revokeConsent = async (consentId: string, reason: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_consents')
        .update({
          revoked_at: new Date().toISOString(),
          revocation_reason: reason
        })
        .eq('id', consentId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await loadData();
      toast.success('Consentimento revogado');
      return true;
    } catch (error) {
      console.error('Error revoking consent:', error);
      toast.error('Erro ao revogar consentimento');
      return false;
    }
  };

  const hasConsent = (documentType: string): boolean => {
    return consents.some(
      c => c.legal_documents?.document_type === documentType && 
           c.consent_given && 
           !c.revoked_at
    );
  };

  const getConsentForDocument = (documentId: string): UserConsent | undefined => {
    return consents.find(c => c.document_id === documentId && !c.revoked_at);
  };

  const hasAllRequiredConsents = (): boolean => {
    const requiredTypes = ['terms_of_use', 'privacy_policy'];
    return requiredTypes.every(type => hasConsent(type));
  };

  return {
    documents,
    consents,
    loading,
    giveConsent,
    revokeConsent,
    hasConsent,
    getConsentForDocument,
    hasAllRequiredConsents,
    reload: loadData
  };
}
