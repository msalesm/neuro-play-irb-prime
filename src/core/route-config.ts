/**
 * Route Access Configuration
 * 
 * Maps route patterns to allowed roles.
 * Routes not listed here are accessible to any authenticated user.
 * Admin always has access to everything (handled in ProtectedRoute).
 */

import type { AppRole } from '@/hooks/useUserRole';

type RouteAccess = {
  pattern: string;
  roles: AppRole[];
};

/**
 * Routes restricted to specific roles.
 * Admin is always implicitly allowed (handled in ProtectedRoute).
 */
export const RESTRICTED_ROUTES: RouteAccess[] = [
  // ── Admin-only ──
  { pattern: '/admin', roles: ['admin'] },
  { pattern: '/admin/network', roles: ['admin'] },
  { pattern: '/admin/users', roles: ['admin'] },
  { pattern: '/admin/relationships', roles: ['admin'] },
  { pattern: '/admin/risk-maps', roles: ['admin'] },
  { pattern: '/admin/stories', roles: ['admin'] },
  { pattern: '/admin/story-editor', roles: ['admin'] },
  { pattern: '/admin/content', roles: ['admin'] },
  { pattern: '/admin/clube-pais', roles: ['admin'] },
  { pattern: '/operations', roles: ['admin'] },
  { pattern: '/institutional', roles: ['admin'] },
  { pattern: '/secretaria-educacao', roles: ['admin'] },
  { pattern: '/integracoes-api', roles: ['admin'] },

  // ── Therapist (+ admin) ──
  { pattern: '/therapist/patients', roles: ['therapist'] },
  { pattern: '/therapist/patient', roles: ['therapist'] },
  { pattern: '/prontuario', roles: ['therapist'] },
  { pattern: '/anamnese', roles: ['therapist'] },
  { pattern: '/teleconsultas', roles: ['therapist'] },
  { pattern: '/teleconsulta', roles: ['therapist'] },
  { pattern: '/inventario-habilidades', roles: ['therapist'] },
  { pattern: '/aba-neuroplay', roles: ['therapist'] },
  { pattern: '/therapeutic-chat', roles: ['therapist'] },
  { pattern: '/professional-analytics', roles: ['therapist'] },
  { pattern: '/clinical', roles: ['therapist'] },
  { pattern: '/diagnostico-completo', roles: ['therapist'] },

  // ── Teacher (+ admin) ──
  { pattern: '/teacher-dashboard', roles: ['teacher'] },
  { pattern: '/teacher/classes', roles: ['teacher'] },
  { pattern: '/teacher/class', roles: ['teacher'] },
  { pattern: '/teacher/student', roles: ['teacher'] },
  { pattern: '/educacao', roles: ['teacher'] },
  { pattern: '/escola-dashboard', roles: ['teacher'] },

  // ── Parent (+ admin) ──
  { pattern: '/dashboard-pais', roles: ['parent'] },
  { pattern: '/minhas-teleconsultas', roles: ['parent'] },
  { pattern: '/agendar-teleconsulta', roles: ['parent'] },
  { pattern: '/clube-pais', roles: ['parent'] },
  { pattern: '/parceiro-clube', roles: ['parent'] },
  { pattern: '/parent-coaching', roles: ['parent'] },
  { pattern: '/assinatura', roles: ['parent'] },

  // ── Patient (+ admin) ──
  { pattern: '/student-hub', roles: ['patient'] },
  { pattern: '/avatar-evolution', roles: ['patient'] },

  // ── Professional (therapist + teacher) ──
  { pattern: '/pei', roles: ['therapist', 'teacher'] },
  { pattern: '/screening', roles: ['therapist', 'teacher'] },
  { pattern: '/risk-analysis', roles: ['therapist', 'teacher'] },

  // ── Billing ──
  { pattern: '/faturamento', roles: ['admin'] },
];

/**
 * Find the allowed roles for a given path.
 * Returns undefined if the route is open to all authenticated users.
 */
export function getRouteRoles(path: string): AppRole[] | undefined {
  // Check exact match first, then prefix match
  const exact = RESTRICTED_ROUTES.find(r => r.pattern === path);
  if (exact) return exact.roles;

  const prefix = RESTRICTED_ROUTES.find(r => path.startsWith(r.pattern + '/'));
  if (prefix) return prefix.roles;

  return undefined;
}
