/**
 * Central Role & Permission System
 * 
 * Single source of truth for all role-based access control.
 * Every module checks permissions through this system.
 */

export const APP_ROLES = ['admin', 'therapist', 'teacher', 'parent', 'patient', 'user'] as const;
export type AppRole = typeof APP_ROLES[number];

// Module definitions
export const MODULES = [
  'games',
  'aba',
  'routines',
  'stories',
  'reports',
  'behavioral-profile',
  'school',
  'clinic',
  'family',
  'prontuario',
  'pei',
  'teleconsult',
  'messaging',
  'gamification',
  'admin',
  'planets',
  'student-hub',
] as const;

export type AppModule = typeof MODULES[number];

// Permission matrix: which roles can access which modules
const ROLE_PERMISSIONS: Record<AppRole, readonly AppModule[]> = {
  admin: MODULES, // Admin has access to everything
  therapist: [
    'games', 'aba', 'routines', 'stories', 'reports', 'behavioral-profile',
    'clinic', 'prontuario', 'pei', 'teleconsult', 'messaging', 'gamification',
  ],
  teacher: [
    'games', 'routines', 'stories', 'reports', 'school', 'pei', 'messaging',
    'behavioral-profile',
  ],
  parent: [
    'games', 'routines', 'stories', 'reports', 'family', 'messaging',
    'gamification', 'planets', 'teleconsult',
  ],
  patient: [
    'games', 'routines', 'stories', 'gamification', 'planets', 'student-hub',
  ],
  user: [
    'games', 'routines', 'stories', 'gamification',
  ],
};

// Data access rules
export type DataScope = 'own' | 'children' | 'patients' | 'class' | 'institution' | 'all';

const ROLE_DATA_SCOPE: Record<AppRole, DataScope> = {
  admin: 'all',
  therapist: 'patients',
  teacher: 'class',
  parent: 'children',
  patient: 'own',
  user: 'own',
};

// Role hierarchy for determining primary role
const ROLE_HIERARCHY: AppRole[] = ['admin', 'therapist', 'teacher', 'parent', 'patient', 'user'];

/**
 * Check if a role has access to a specific module
 */
export function canAccessModule(role: AppRole, module: AppModule): boolean {
  return ROLE_PERMISSIONS[role]?.includes(module) ?? false;
}

/**
 * Get all accessible modules for a role
 */
export function getAccessibleModules(role: AppRole): readonly AppModule[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Get the data scope for a role
 */
export function getDataScope(role: AppRole): DataScope {
  return ROLE_DATA_SCOPE[role] ?? 'own';
}

/**
 * Get primary role from a list (highest privilege)
 */
export function getPrimaryRole(roles: AppRole[]): AppRole | null {
  return ROLE_HIERARCHY.find(r => roles.includes(r)) ?? null;
}

/**
 * Check if role can perform write operations on a module
 */
export function canWrite(role: AppRole, module: AppModule): boolean {
  // Read-only restrictions
  const readOnlyModules: Partial<Record<AppRole, AppModule[]>> = {
    parent: ['behavioral-profile', 'prontuario'],
    teacher: ['prontuario', 'behavioral-profile'],
    patient: [],
  };
  
  if (!canAccessModule(role, module)) return false;
  return !(readOnlyModules[role]?.includes(module) ?? false);
}

/**
 * Get the home route for a role
 */
export function getHomeRoute(role: AppRole): string {
  switch (role) {
    case 'admin': return '/admin/network';
    case 'therapist': return '/therapist/patients';
    case 'teacher': return '/educacao';
    case 'patient': return '/student-hub';
    case 'parent': return '/dashboard-pais';
    case 'user': return '/dashboard-pais';
    default: return '/dashboard-pais';
  }
}

/**
 * Dashboard configuration per role
 */
export interface DashboardConfig {
  title: string;
  description: string;
  primaryActions: string[];
  widgets: string[];
}

export function getDashboardConfig(role: AppRole): DashboardConfig {
  switch (role) {
    case 'patient':
      return {
        title: 'Meu Espaço',
        description: 'Jogos, histórias e conquistas',
        primaryActions: ['play-games', 'view-stories', 'check-achievements'],
        widgets: ['progress-visual', 'daily-missions', 'achievements', 'planets'],
      };
    case 'parent':
      return {
        title: 'Painel da Família',
        description: 'Acompanhe o progresso do seu filho',
        primaryActions: ['view-progress', 'view-reports', 'manage-routine'],
        widgets: ['child-evolution', 'recommendations', 'activities', 'routine'],
      };
    case 'therapist':
      return {
        title: 'Painel Clínico',
        description: 'Gestão de pacientes e programas',
        primaryActions: ['view-patients', 'manage-aba', 'generate-reports'],
        widgets: ['patient-list', 'aba-progress', 'session-data', 'alerts'],
      };
    case 'teacher':
      return {
        title: 'Área do Professor',
        description: 'Gestão de turma e indicadores',
        primaryActions: ['view-class', 'check-indicators', 'manage-pei'],
        widgets: ['class-overview', 'student-indicators', 'engagement', 'recommendations'],
      };
    case 'admin':
      return {
        title: 'Administração',
        description: 'Gestão da rede e indicadores',
        primaryActions: ['manage-users', 'view-analytics', 'manage-institutions'],
        widgets: ['network-overview', 'risk-map', 'operational-metrics', 'audit-logs'],
      };
    default:
      return {
        title: 'NeuroPlay',
        description: 'Aprendizado Cognitivo Interativo',
        primaryActions: ['play-games'],
        widgets: ['progress-visual'],
      };
  }
}
