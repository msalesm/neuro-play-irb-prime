/**
 * Centralized Navigation Configuration — NeuroPlay EDU
 *
 * Roles ativos: admin, teacher, student.
 */

import {
  Home, Gamepad2, FileText, GraduationCap, Settings,
  User, Trophy, Sparkles, ClipboardCheck, Users,
  School, Building2, BookOpen, Shield, UserCircle,
  type LucideIcon,
} from 'lucide-react';
import type { AppRole } from './roles';
import { normalizeRole } from './roles';

export interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  description?: string;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

export interface BottomNavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

export interface RoleBadgeConfig {
  label: string;
  icon: LucideIcon;
  gradient: string;
}

// ========== ROLE BADGES ==========
export const ROLE_BADGES: Record<string, RoleBadgeConfig> = {
  admin: {
    label: 'Diretor / Coordenador',
    icon: Shield,
    gradient: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0',
  },
  teacher: {
    label: 'Professor',
    icon: School,
    gradient: 'bg-gradient-to-r from-blue-600 to-sky-600 text-white border-0',
  },
  student: {
    label: 'Aluno',
    icon: Gamepad2,
    gradient: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0',
  },
};

// ========== NAVIGATION BY ROLE ==========

const TEACHER_NAV: NavItem[] = [
  { title: 'Início', path: '/teacher-dashboard', icon: Home },
  { title: 'Minhas Turmas', path: '/teacher/classes', icon: Users },
  { title: 'Triagens', path: '/screening', icon: ClipboardCheck },
  { title: 'Planos de Apoio', path: '/pei', icon: FileText },
  { title: 'Capacitação', path: '/training', icon: BookOpen },
];

const ADMIN_NAV: NavItem[] = [
  { title: 'Painel da Escola', path: '/escola-dashboard', icon: Building2 },
  { title: 'Educação', path: '/educacao', icon: School },
  { title: 'Turmas', path: '/teacher/classes', icon: Users },
  { title: 'Triagens', path: '/screening', icon: ClipboardCheck },
  { title: 'Planos de Apoio', path: '/pei', icon: FileText },
  { title: 'Capacitação', path: '/training', icon: BookOpen },
];

const STUDENT_NAV: NavItem[] = [
  { title: 'Meu Espaço', path: '/student-hub', icon: Home },
  { title: 'Planeta Azul', path: '/sistema-planeta-azul', icon: Sparkles },
  { title: 'Jogos', path: '/games', icon: Gamepad2 },
  { title: 'Conquistas', path: '/conquistas', icon: Trophy },
];

const SETTINGS_NAV: NavItem[] = [
  { title: 'Configurações', path: '/settings', icon: Settings },
];

// ========== BOTTOM NAV BY ROLE ==========

const TEACHER_BOTTOM: BottomNavItem[] = [
  { name: 'Início', path: '/teacher-dashboard', icon: Home },
  { name: 'Turmas', path: '/teacher/classes', icon: Users },
  { name: 'Triagens', path: '/screening', icon: ClipboardCheck },
  { name: 'Planos', path: '/pei', icon: FileText },
];

const ADMIN_BOTTOM: BottomNavItem[] = [
  { name: 'Escola', path: '/escola-dashboard', icon: Building2 },
  { name: 'Turmas', path: '/teacher/classes', icon: Users },
  { name: 'Triagens', path: '/screening', icon: ClipboardCheck },
  { name: 'Planos', path: '/pei', icon: FileText },
];

const STUDENT_BOTTOM: BottomNavItem[] = [
  { name: 'Início', path: '/student-hub', icon: Home },
  { name: 'Mapa', path: '/sistema-planeta-azul', icon: Sparkles },
  { name: 'Jogos', path: '/games', icon: Gamepad2 },
  { name: 'Conquistas', path: '/conquistas', icon: Trophy },
];

const DEFAULT_BOTTOM: BottomNavItem[] = [
  { name: 'Início', path: '/', icon: Home },
  { name: 'Perfil', path: '/settings', icon: User },
];

// ========== PUBLIC API ==========

export function getSidebarSections(role: AppRole | null, isAdmin: boolean): NavSection[] {
  const r = isAdmin ? 'admin' : normalizeRole(role);

  const sections: NavSection[] = [];
  if (r === 'admin') {
    sections.push({ id: 'admin', label: 'Administração', items: ADMIN_NAV });
  } else if (r === 'teacher') {
    sections.push({ id: 'teacher', label: 'Área do Professor', items: TEACHER_NAV });
  } else if (r === 'student') {
    sections.push({ id: 'student', label: 'Meu Espaço', items: STUDENT_NAV });
  }
  sections.push({ id: 'settings', label: 'Configurações', items: SETTINGS_NAV });
  return sections;
}

export function getMobileMenuSections(role: AppRole | null, isAdmin: boolean): NavSection[] {
  return getSidebarSections(role, isAdmin);
}

export function getBottomNavItems(role: AppRole | null, isAdmin: boolean): BottomNavItem[] {
  if (isAdmin) return ADMIN_BOTTOM;
  const r = normalizeRole(role);
  if (r === 'teacher') return TEACHER_BOTTOM;
  if (r === 'student') return STUDENT_BOTTOM;
  return DEFAULT_BOTTOM;
}

export function getRoleBadge(role: AppRole | null): RoleBadgeConfig | null {
  if (!role) return null;
  const r = normalizeRole(role);
  return r ? (ROLE_BADGES[r] ?? null) : null;
}
