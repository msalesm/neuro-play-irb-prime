/**
 * Centralized Navigation Configuration
 * 
 * Single source of truth for all role-based navigation.
 * Consumed by AppSidebar, MobileMenu, and BottomNavigation.
 */

import { 
  Home, Gamepad2, FileText, GraduationCap, Settings, 
  User, Trophy, TrendingUp, Brain, Stethoscope, Heart,
  Play, BookOpen, ClipboardCheck, Users, School, Sparkles, BarChart3,
  Shield, UserCircle, Briefcase, Building2, Drama, CalendarCheck, 
  Mail, CreditCard, Calendar, ClipboardList, Gem, Activity, Map,
  type LucideIcon
} from 'lucide-react';
import type { AppRole } from './roles';

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
    label: 'Administrador',
    icon: Shield,
    gradient: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0',
  },
  therapist: {
    label: 'Terapeuta',
    icon: Briefcase,
    gradient: 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white border-0',
  },
  parent: {
    label: 'Pai/Mãe',
    icon: UserCircle,
    gradient: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0',
  },
  patient: {
    label: 'Paciente',
    icon: Gamepad2,
    gradient: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0',
  },
  teacher: {
    label: 'Professor',
    icon: School,
    gradient: 'bg-gradient-to-r from-blue-600 to-sky-600 text-white border-0',
  },
};

// ========== NAVIGATION BY ROLE ==========

const PATIENT_NAV: NavItem[] = [
  { title: 'Meu Dia', path: '/student-hub', icon: Home },
  { title: 'Planeta Azul', path: '/sistema-planeta-azul', icon: Sparkles },
  { title: 'Histórias Sociais', path: '/stories', icon: Drama },
  { title: 'Conquistas', path: '/conquistas', icon: Trophy },
  { title: 'Histórico Emocional', path: '/emotional-history', icon: Heart },
];

const PARENT_NAV: NavItem[] = [
  { title: 'Dashboard', path: '/dashboard-pais', icon: Home },
  { title: 'Progresso', path: '/learning-dashboard', icon: TrendingUp },
  { title: 'Agenda', path: '/agenda', icon: CalendarCheck },
  { title: 'Relatórios', path: '/relatorios', icon: FileText },
  { title: 'Mensagens', path: '/mensagens', icon: Mail },
  { title: 'Microlearning', path: '/training', icon: BookOpen },
];

const THERAPIST_NAV: NavItem[] = [
  { title: 'Pacientes', path: '/therapist/patients', icon: Users, description: 'Prontuário, PEI e acompanhamento' },
  { title: 'Agenda', path: '/agenda', icon: Calendar },
  { title: 'Teleconsultas', path: '/teleconsultas', icon: Stethoscope },
  { title: 'ABA NeuroPlay', path: '/aba-neuroplay', icon: Activity, description: 'Programas de intervenção ABA' },
  { title: 'Relatórios', path: '/relatorios', icon: FileText },
  { title: 'Mensagens', path: '/mensagens', icon: Mail },
];

const TEACHER_NAV: NavItem[] = [
  { title: 'Educação', path: '/educacao', icon: School, description: 'Turmas, check-in e relatórios' },
  { title: 'Turmas', path: '/teacher/classes', icon: Users },
  { title: 'Relatórios', path: '/relatorios', icon: FileText },
  { title: 'Mensagens', path: '/mensagens', icon: Mail },
];

const ADMIN_NAV: NavItem[] = [
  { title: 'Institucional', path: '/institutional', icon: Building2 },
  { title: 'Operações', path: '/operations', icon: TrendingUp },
  { title: 'Usuários', path: '/admin/users', icon: Users },
  { title: 'Pacientes', path: '/therapist/patients', icon: Users },
  { title: 'Teleconsultas', path: '/teleconsultas', icon: Stethoscope },
  { title: 'ABA NeuroPlay', path: '/aba-neuroplay', icon: Activity },
  { title: 'Educação', path: '/educacao', icon: School },
  { title: 'Relatórios', path: '/relatorios', icon: FileText },
];

const SETTINGS_NAV: NavItem[] = [
  { title: 'Configurações', path: '/settings', icon: Settings },
];

// ========== BOTTOM NAV BY ROLE ==========

const PATIENT_BOTTOM: BottomNavItem[] = [
  { name: 'Início', path: '/student-hub', icon: Home },
  { name: 'Mapa', path: '/sistema-planeta-azul', icon: Sparkles },
  { name: 'Jogos', path: '/games', icon: Gamepad2 },
  { name: 'Conquistas', path: '/conquistas', icon: Trophy },
];

const PARENT_BOTTOM: BottomNavItem[] = [
  { name: 'Dashboard', path: '/dashboard-pais', icon: Home },
  { name: 'Progresso', path: '/learning-dashboard', icon: TrendingUp },
  { name: 'Agenda', path: '/agenda', icon: Calendar },
  { name: 'Relatórios', path: '/relatorios', icon: FileText },
];

const THERAPIST_BOTTOM: BottomNavItem[] = [
  { name: 'Pacientes', path: '/therapist/patients', icon: Users },
  { name: 'Agenda', path: '/agenda', icon: Calendar },
  { name: 'Teleconsultas', path: '/teleconsultas', icon: Stethoscope },
  { name: 'Relatórios', path: '/relatorios', icon: FileText },
];

const TEACHER_BOTTOM: BottomNavItem[] = [
  { name: 'Educação', path: '/educacao', icon: School },
  { name: 'Turmas', path: '/teacher/classes', icon: Users },
  { name: 'Relatórios', path: '/relatorios', icon: FileText },
  { name: 'Mensagens', path: '/mensagens', icon: Mail },
];

const ADMIN_BOTTOM: BottomNavItem[] = [
  { name: 'Institucional', path: '/institutional', icon: Building2 },
  { name: 'Operações', path: '/operations', icon: TrendingUp },
  { name: 'Usuários', path: '/admin/users', icon: Users },
  { name: 'Relatórios', path: '/relatorios', icon: FileText },
];

const DEFAULT_BOTTOM: BottomNavItem[] = [
  { name: 'Jogos', path: '/games', icon: Gamepad2 },
  { name: 'Planeta', path: '/sistema-planeta-azul', icon: Sparkles },
  { name: 'Relatórios', path: '/relatorios', icon: FileText },
  { name: 'Perfil', path: '/profile', icon: User },
];

// ========== ADMIN MOBILE SECTIONS (compact view) ==========
const ADMIN_MOBILE_SECTIONS: NavSection[] = [
  {
    id: 'admin-admin',
    label: 'Administração',
    items: [
      { title: 'Dashboard Institucional', path: '/institutional', icon: Building2 },
      { title: 'Centro de Operações', path: '/operations', icon: TrendingUp },
      { title: 'Gerenciar Usuários', path: '/admin/users', icon: Users },
    ],
  },
  {
    id: 'admin-clinical',
    label: 'Clínico',
    items: [
      { title: 'Pacientes', path: '/therapist/patients', icon: Users },
      { title: 'Teleconsultas', path: '/teleconsultas', icon: Stethoscope },
      { title: 'ABA NeuroPlay', path: '/aba-neuroplay', icon: Activity },
    ],
  },
  {
    id: 'admin-education',
    label: 'Educação',
    items: [
      { title: 'Educação', path: '/educacao', icon: School },
      { title: 'Escola', path: '/escola-dashboard', icon: Building2 },
    ],
  },
  {
    id: 'admin-reports',
    label: 'Relatórios',
    items: [
      { title: 'Relatórios', path: '/relatorios', icon: FileText },
      { title: 'Agenda', path: '/agenda', icon: Calendar },
    ],
  },
];

// ========== PUBLIC API ==========

/**
 * Get sidebar/mobile-menu sections for a given role
 */
export function getSidebarSections(role: AppRole | null, isAdmin: boolean): NavSection[] {
  // Admin sees ALL role areas in the sidebar
  if (isAdmin) {
    return [
      { id: 'admin', label: 'Administração', items: ADMIN_NAV },
      { id: 'therapist', label: 'Área Clínica', items: THERAPIST_NAV },
      { id: 'parents', label: 'Área dos Pais', items: PARENT_NAV },
      { id: 'teacher', label: 'Área do Professor', items: TEACHER_NAV },
      { id: 'patient', label: 'Área do Paciente', items: PATIENT_NAV },
      { id: 'settings', label: 'Configurações', items: SETTINGS_NAV },
    ];
  }

  const sections: NavSection[] = [];

  if (role === 'patient') {
    sections.push({ id: 'patient', label: 'Meu Espaço', items: PATIENT_NAV });
  }

  if (role === 'parent' || (!role && !isAdmin)) {
    sections.push({ id: 'parents', label: 'Área dos Pais', items: PARENT_NAV });
  }

  if (role === 'therapist') {
    sections.push({ id: 'therapist', label: 'Área Clínica', items: THERAPIST_NAV });
  }

  if (role === 'teacher') {
    sections.push({ id: 'teacher', label: 'Área do Professor', items: TEACHER_NAV });
  }

  sections.push({ id: 'settings', label: 'Configurações', items: SETTINGS_NAV });

  return sections;
}

/**
 * Get expanded admin mobile sections (shows all role areas)
 */
export function getAdminMobileSections(): NavSection[] {
  return ADMIN_MOBILE_SECTIONS;
}

/**
 * Get mobile menu sections for a given role
 */
export function getMobileMenuSections(role: AppRole | null, isAdmin: boolean): NavSection[] {
  if (isAdmin) {
    const sections = [...getAdminMobileSections()];
    sections.push({ id: 'settings', label: 'Configurações', items: [
      { title: 'Perfil', path: '/profile', icon: User },
      { title: 'Configurações', path: '/settings', icon: Settings },
    ]});
    return sections;
  }

  const sections: NavSection[] = [];

  if (role === 'patient') {
    sections.push({ id: 'patient', label: 'Meu Espaço', items: PATIENT_NAV });
  }

  if (role === 'parent' || (!role && !isAdmin)) {
    sections.push({ id: 'parents', label: 'Área dos Pais', items: PARENT_NAV });
  }

  if (role === 'therapist') {
    sections.push({ id: 'therapist', label: 'Área Clínica', items: THERAPIST_NAV });
  }

  if (role === 'teacher') {
    sections.push({ id: 'teacher', label: 'Área do Professor', items: TEACHER_NAV });
  }

  sections.push({ id: 'settings', label: 'Configurações', items: [
    { title: 'Perfil', path: '/profile', icon: User },
    { title: 'Configurações', path: '/settings', icon: Settings },
  ]});

  return sections;
}

/**
 * Get bottom navigation items for a given role
 */
export function getBottomNavItems(role: AppRole | null, isAdmin: boolean): BottomNavItem[] {
  if (role === 'patient') return PATIENT_BOTTOM;
  if (role === 'parent') return PARENT_BOTTOM;
  if (role === 'therapist') return THERAPIST_BOTTOM;
  if (role === 'teacher') return TEACHER_BOTTOM;
  if (isAdmin) return ADMIN_BOTTOM;
  return DEFAULT_BOTTOM;
}

/**
 * Get role badge config
 */
export function getRoleBadge(role: AppRole | null): RoleBadgeConfig | null {
  if (!role) return null;
  return ROLE_BADGES[role] ?? null;
}
