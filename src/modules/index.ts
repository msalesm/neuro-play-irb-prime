/**
 * NeuroPlay Modules
 * 
 * Central registry of all domain modules.
 * Each module encapsulates its engine, hooks, services, types, and components.
 * 
 * Usage:
 *   import { useGameEngine } from '@/modules/games';
 *   import { useBehavioralProfile } from '@/modules/behavioral';
 *   import { useReportEngine } from '@/modules/reports';
 *   import { useAbaPrograms } from '@/modules/aba';
 */

export * as Games from './games';
export * as ABA from './aba';
export * as Stories from './stories';
export * as Routines from './routines';
export * as Behavioral from './behavioral';
export * as Reports from './reports';
export * as School from './school';
export * as Clinic from './clinic';
export * as Family from './family';
