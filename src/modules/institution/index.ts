/**
 * 🏫 Institution Analytics Module
 * 
 * Dashboards and analytics for classes and schools.
 */

export {
  type ClassAnalytics,
  type ClassDomainAverage,
  type StudentSummary,
  calculateClassAnalytics,
  identifyStudentsNeedingSupport,
} from './class-analytics';

export {
  type SchoolAnalytics,
  type ClassComparison,
  calculateSchoolAnalytics,
  identifyClassesNeedingAttention,
} from './school-analytics';

export {
  type InstitutionReport,
  generateInstitutionReport,
} from './institution-report';
