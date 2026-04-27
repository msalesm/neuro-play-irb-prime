/**
 * Central Role & Permission System — NeuroPlay EDU
 *
 * Active roles: admin (diretor/coordenador), teacher (professor), student (aluno).
 * Legacy roles (parent, therapist, patient, user) remain in the enum for DB
 * backward-compat but are migrated to 'teacher' on signin/onboarding.
 */

export const APP_ROLES = ['admin', 'teacher', 'student', 'therapist', 'parent', 'patient', 'user'] as const;
export type AppRole = typeof APP_ROLES[number];

export const ACTIVE_ROLES = ['admin', 'teacher', 'student'] as const;
export type ActiveRole = typeof ACTIVE_ROLES[number];

export const MODULES = [
  'games', 'screening', 'pei', 'school', 'reports',
  'training', 'planets', 'student-hub', 'admin', 'gamification',
] as const;
export type AppModule = typeof MODULES[number];

const ROLE_PERMISSIONS: Record<AppRole, readonly AppModule[]> = {
  admin: MODULES,
  teacher: ['games', 'screening', 'pei', 'school', 'reports', 'training'],
  student: ['games', 'planets', 'student-hub', 'gamification'],
  // legacy → mapped to teacher access
  therapist: ['games', 'screening', 'pei', 'school', 'reports', 'training'],
  parent: ['games', 'screening', 'pei', 'school', 'reports', 'training'],
  patient: ['games', 'planets', 'student-hub', 'gamification'],
  user: ['games'],
};

export type DataScope = 'own' | 'class' | 'institution' | 'all';

const ROLE_DATA_SCOPE: Record<AppRole, DataScope> = {
  admin: 'all',
  teacher: 'class',
  student: 'own',
  therapist: 'class',
  parent: 'class',
  patient: 'own',
  user: 'own',
};

const ROLE_HIERARCHY: AppRole[] = ['admin', 'teacher', 'student', 'therapist', 'parent', 'patient', 'user'];

export function canAccessModule(role: AppRole, module: AppModule): boolean {
  return ROLE_PERMISSIONS[role]?.includes(module) ?? false;
}

export function getAccessibleModules(role: AppRole): readonly AppModule[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function getDataScope(role: AppRole): DataScope {
  return ROLE_DATA_SCOPE[role] ?? 'own';
}

export function getPrimaryRole(roles: AppRole[]): AppRole | null {
  return ROLE_HIERARCHY.find(r => roles.includes(r)) ?? null;
}

export function canWrite(role: AppRole, module: AppModule): boolean {
  return canAccessModule(role, module);
}

/** Map any legacy/active role to the canonical one used by UI. */
export function normalizeRole(role: AppRole | null): ActiveRole | null {
  if (!role) return null;
  if (role === 'admin') return 'admin';
  if (role === 'student' || role === 'patient') return 'student';
  // teacher, therapist, parent, user → all behave as teacher
  return 'teacher';
}

export function getHomeRoute(role: AppRole | null): string {
  const r = normalizeRole(role);
  switch (r) {
    case 'admin': return '/escola-dashboard';
    case 'teacher': return '/teacher-dashboard';
    case 'student': return '/student-hub';
    default: return '/';
  }
}

export interface DashboardConfig {
  title: string;
  description: string;
  primaryActions: string[];
  widgets: string[];
}

export function getDashboardConfig(role: AppRole): DashboardConfig {
  const r = normalizeRole(role);
  switch (r) {
    case 'student':
      return {
        title: 'Meu Espaço',
        description: 'Jogos e conquistas',
        primaryActions: ['play-games', 'check-achievements'],
        widgets: ['progress-visual', 'achievements', 'planets'],
      };
    case 'teacher':
      return {
        title: 'Painel do Professor',
        description: 'Turmas, triagens e planos de apoio',
        primaryActions: ['view-class', 'run-screening', 'manage-pei'],
        widgets: ['class-overview', 'screenings', 'pei-active'],
      };
    case 'admin':
      return {
        title: 'Painel da Escola',
        description: 'Visão institucional',
        primaryActions: ['manage-teachers', 'view-classes'],
        widgets: ['school-overview', 'class-list'],
      };
    default:
      return {
        title: 'NeuroPlay EDU',
        description: 'Plataforma educacional',
        primaryActions: [],
        widgets: [],
      };
  }
}
