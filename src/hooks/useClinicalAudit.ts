import { supabase } from '@/integrations/supabase/client';

type AuditActionType = 
  | 'view_record' 
  | 'edit_record' 
  | 'create_assessment' 
  | 'complete_assessment'
  | 'schedule_teleconsult' 
  | 'start_teleconsult' 
  | 'end_teleconsult'
  | 'generate_report' 
  | 'export_data' 
  | 'share_access' 
  | 'revoke_access'
  | 'add_note' 
  | 'edit_note' 
  | 'delete_note';

interface AuditLogParams {
  actionType: AuditActionType;
  resourceType: string;
  resourceId?: string;
  childId?: string;
  details?: Record<string, unknown>;
}

export function useClinicalAudit() {
  const logAction = async ({
    actionType,
    resourceType,
    resourceId,
    childId,
    details = {}
  }: AuditLogParams) => {
    try {
      const { data, error } = await supabase.rpc('log_clinical_audit', {
        p_action_type: actionType,
        p_resource_type: resourceType,
        p_resource_id: resourceId || null,
        p_child_id: childId || null,
        p_action_details: JSON.parse(JSON.stringify(details)),
        p_user_agent: navigator.userAgent
      });

      if (error) {
        console.error('Audit log error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to log audit action:', error);
      return null;
    }
  };

  // Convenience methods for common actions
  const logViewRecord = (resourceType: string, resourceId: string, childId?: string) =>
    logAction({ actionType: 'view_record', resourceType, resourceId, childId });

  const logEditRecord = (resourceType: string, resourceId: string, childId?: string, details?: Record<string, unknown>) =>
    logAction({ actionType: 'edit_record', resourceType, resourceId, childId, details });

  const logCreateAssessment = (assessmentType: string, childId: string) =>
    logAction({ actionType: 'create_assessment', resourceType: assessmentType, childId });

  const logCompleteAssessment = (assessmentType: string, assessmentId: string, childId: string, details?: Record<string, unknown>) =>
    logAction({ actionType: 'complete_assessment', resourceType: assessmentType, resourceId: assessmentId, childId, details });

  const logScheduleTeleconsult = (sessionId: string, childId?: string) =>
    logAction({ actionType: 'schedule_teleconsult', resourceType: 'teleconsultation', resourceId: sessionId, childId });

  const logStartTeleconsult = (sessionId: string, childId?: string) =>
    logAction({ actionType: 'start_teleconsult', resourceType: 'teleconsultation', resourceId: sessionId, childId });

  const logEndTeleconsult = (sessionId: string, childId?: string, details?: Record<string, unknown>) =>
    logAction({ actionType: 'end_teleconsult', resourceType: 'teleconsultation', resourceId: sessionId, childId, details });

  const logGenerateReport = (reportType: string, reportId: string, childId?: string) =>
    logAction({ actionType: 'generate_report', resourceType: reportType, resourceId: reportId, childId });

  const logExportData = (exportType: string, childId?: string, details?: Record<string, unknown>) =>
    logAction({ actionType: 'export_data', resourceType: exportType, childId, details });

  const logShareAccess = (childId: string, professionalId: string, accessLevel: string) =>
    logAction({ actionType: 'share_access', resourceType: 'child_access', childId, details: { professionalId, accessLevel } });

  const logRevokeAccess = (childId: string, professionalId: string) =>
    logAction({ actionType: 'revoke_access', resourceType: 'child_access', childId, details: { professionalId } });

  const logAddNote = (noteId: string, childId?: string) =>
    logAction({ actionType: 'add_note', resourceType: 'clinical_note', resourceId: noteId, childId });

  const logEditNote = (noteId: string, childId?: string) =>
    logAction({ actionType: 'edit_note', resourceType: 'clinical_note', resourceId: noteId, childId });

  return {
    logAction,
    logViewRecord,
    logEditRecord,
    logCreateAssessment,
    logCompleteAssessment,
    logScheduleTeleconsult,
    logStartTeleconsult,
    logEndTeleconsult,
    logGenerateReport,
    logExportData,
    logShareAccess,
    logRevokeAccess,
    logAddNote,
    logEditNote
  };
}
