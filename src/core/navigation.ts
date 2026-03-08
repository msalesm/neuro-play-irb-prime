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
  { title: 'Minhas Conquistas', path: '/learning-dashboard', icon: Trophy },
  { title: 'Meu Perfil', path: '/profile', icon: User },
  { title: 'Histórico Emocional', path: '/emotional-history', icon: Heart },
];

const PARENT_NAV: NavItem[] = [
  { title: 'Dashboard', path: '/dashboard-pais', icon: Home },
  { title: 'Agendar Consultas', path: '/agenda', icon: CalendarCheck, badge: 'Novo' },
  { title: 'Minhas Teleconsultas', path: '/minhas-teleconsultas', icon: Stethoscope, badge: 'Novo' },
  { title: 'Relatório Familiar', path: '/relatorios', icon: FileText },
  { title: 'Progresso dos Filhos', path: '/learning-dashboard', icon: TrendingUp },
  { title: 'Mensagens', path: '/messages', icon: Mail, badge: 'Novo' },
  { title: 'Clube dos Pais', path: '/clube-pais', icon: Gem, badge: 'Novo' },
  { title: 'Microlearning', path: '/training', icon: BookOpen },
  { title: 'Coaching Parental', path: '/parent-coaching', icon: Heart, badge: 'Novo' },
  { title: 'Minha Assinatura', path: '/subscription', icon: CreditCard, badge: 'Novo' },
];

const THERAPIST_NAV: NavItem[] = [
  { title: 'Pacientes', path: '/therapist/patients', icon: Users, description: 'Prontuário, PEI e acompanhamento' },
  { title: 'Agenda', path: '/agenda', icon: Calendar },
  { title: 'Teleconsultas', path: '/teleconsultas', icon: Stethoscope },
  { title: 'Avaliações', path: '/diagnostic-tests', icon: ClipboardCheck },
  { title: 'Inventário de Habilidades', path: '/inventario-habilidades', icon: ClipboardCheck },
  { title: 'Anamnese', path: '/anamnese', icon: ClipboardList, badge: 'Novo' },
  { title: 'Relatório Clínico', path: '/relatorios', icon: FileText },
  { title: 'ABA+', path: '/aba-integration', icon: Activity, badge: 'Novo' },
  { title: 'ABA NeuroPlay', path: '/aba-neuroplay', icon: Activity, description: 'Programas de intervenção ABA' },
  { title: 'Mensagens', path: '/messages', icon: Mail },
];

const TEACHER_NAV: NavItem[] = [
  { title: 'Neuro Play Educação', path: '/educacao', icon: School, description: 'Turmas, check-in e relatórios' },
  { title: 'Dashboard da Escola', path: '/escola-dashboard', icon: Building2, description: 'Visão macro da escola' },
  { title: 'Mensagens', path: '/messages', icon: Mail },
];

const ADMIN_NAV: NavItem[] = [
  { title: 'Dashboard Institucional', path: '/institutional', icon: Building2 },
  { title: 'Centro de Operações', path: '/operations', icon: TrendingUp },
  { title: 'Relatórios', path: '/relatorios', icon: FileText },
  { title: 'Pacientes', path: '/therapist/patients', icon: Users },
  { title: 'Teleconsultas', path: '/teleconsultas', icon: Stethoscope },
  { title: 'ABA+', path: '/aba-integration', icon: Activity, badge: 'Novo' },
  { title: 'ABA NeuroPlay', path: '/aba-neuroplay', icon: Activity },
  { title: 'Neuro Play Educação', path: '/educacao', icon: School },
  { title: 'Dashboard da Escola', path: '/escola-dashboard', icon: School },
  { title: 'Secretaria Municipal', path: '/secretaria-educacao', icon: Building2 },
  { title: 'Gerenciar Usuários', path: '/admin/users', icon: Users },
  { title: 'Clube dos Pais', path: '/admin/clube-pais', icon: Gem },
];

const SETTINGS_NAV: NavItem[] = [
  { title: 'Configurações', path: '/settings', icon: Settings },
];

// ========== BOTTOM NAV BY ROLE ==========

const PATIENT_BOTTOM: BottomNavItem[] = [
  { name: 'Início', path: '/student-hub', icon: Home },
  { name: 'Mapa', path: '/world-map', icon: Map },
  { name: 'Jogos', path: '/sistema-planeta-azul', icon: Gamepad2 },
  { name: 'Conquistas', path: '/achievements', icon: Trophy },
  { name: 'Perfil', path: '/settings', icon: Users },
];

const PARENT_BOTTOM: BottomNavItem[] = [
  { name: 'Dashboard', path: '/dashboard-pais', icon: Home },
  { name: 'Agenda', path: '/agenda', icon: Calendar },
  { name: 'Progresso', path: '/learning-dashboard', icon: TrendingUp },
  { name: 'Relatórios', path: '/relatorios', icon: FileText },
];

const THERAPIST_BOTTOM: BottomNavItem[] = [
  { name: 'Pacientes', path: '/therapist/patients', icon: Users },
  { name: 'Agenda', path: '/agenda', icon: Calendar },
  { name: 'Teleconsultas', path: '/teleconsultas', icon: Stethoscope },
  { name: 'Avaliações', path: '/diagnostic-tests', icon: ClipboardCheck },
];

const TEACHER_BOTTOM: BottomNavItem[] = [
  { name: 'Educação', path: '/educacao', icon: School },
  { name: 'Turmas', path: '/teacher/classes', icon: Users },
  { name: 'Avaliações', path: '/screening', icon: ClipboardCheck },
  { name: 'Relatórios', path: '/reports', icon: FileText },
];

const ADMIN_BOTTOM: BottomNavItem[] = [
  { name: 'Institucional', path: '/institutional', icon: Building2 },
  { name: 'Operações', path: '/operations', icon: TrendingUp },
  { name: 'Usuários', path: '/admin/users', icon: Users },
  { name: 'Agenda', path: '/agenda', icon: Calendar },
];

const DEFAULT_BOTTOM: BottomNavItem[] = [
  { name: 'Planeta Azul', path: '/sistema-planeta-azul', icon: Sparkles },
  { name: 'Jogos', path: '/games', icon: Gamepad2 },
  { name: 'Aprendizado', path: '/learning-dashboard', icon: GraduationCap },
  { name: 'Relatórios', path: '/relatorios', icon: FileText },
];

// ========== ADMIN MOBILE SECTIONS (expanded view) ==========
const ADMIN_MOBILE_SECTIONS: NavSection[] = [
  {
    id: 'admin-patient',
    label: 'Pacientes',
    items: [
      { title: 'Meu Dia', path: '/student-hub', icon: Home },
      { title: 'Planeta Azul', path: '/sistema-planeta-azul', icon: Sparkles },
      { title: 'Histórias Sociais', path: '/stories', icon: Drama },
      { title: 'Conquistas', path: '/learning-dashboard', icon: Trophy },
    ],
  },
  {
    id: 'admin-parents',
    label: 'Pais',
    items: [
      { title: 'Dashboard', path: '/dashboard-pais', icon: Home },
      { title: 'Agendar Consultas', path: '/agenda', icon: CalendarCheck },
      { title: 'Teleconsultas', path: '/minhas-teleconsultas', icon: Stethoscope },
      { title: 'Relatórios', path: '/relatorios', icon: BarChart3 },
      { title: 'Clube dos Pais', path: '/clube-pais', icon: Gem },
    ],
  },
  {
    id: 'admin-therapist',
    label: 'Terapeuta',
    items: [
      { title: 'Agenda do Dia', path: '/agenda', icon: Calendar },
      { title: 'Pacientes', path: '/therapist/patients', icon: Users },
      { title: 'Teleconsultas', path: '/teleconsultas', icon: Stethoscope },
      { title: 'Prontuário Eletrônico', path: '/clinical', icon: FileText },
      { title: 'Avaliações Clínicas', path: '/diagnostic-tests', icon: ClipboardCheck },
      { title: 'Inventário de Habilidades', path: '/inventario-habilidades', icon: ClipboardCheck },
    ],
  },
  {
    id: 'admin-teacher',
    label: 'Professor',
    items: [
      { title: 'Neuro Play Educação', path: '/educacao', icon: School },
      { title: 'Dashboard da Escola', path: '/escola-dashboard', icon: School },
      { title: 'Turmas', path: '/teacher/classes', icon: Users },
      { title: 'Triagem Escolar', path: '/screening', icon: ClipboardCheck },
    ],
  },
  {
    id: 'admin-admin',
    label: 'Administração',
    items: [
      { title: 'Dashboard Institucional', path: '/institutional', icon: Building2 },
      { title: 'Centro de Operações', path: '/operations', icon: TrendingUp },
      { title: 'Gerenciar Usuários', path: '/admin/users', icon: Users },
      { title: 'Clube dos Pais', path: '/admin/clube-pais', icon: Gem },
    ],
  },
];

// ========== PUBLIC API ==========

/**
 * Get sidebar/mobile-menu sections for a given role
 */
export function getSidebarSections(role: AppRole | null, isAdmin: boolean): NavSection[] {
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

  if (isAdmin) {
    sections.push({ id: 'admin', label: 'Administração', items: ADMIN_NAV });
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
