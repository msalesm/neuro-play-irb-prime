// Server-side validation for clinical report generation
// Using a minimal validation approach since Deno doesn't support all npm packages

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function validateReportRequest(data: any, authenticatedUserId: string, isAdmin: boolean = false): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate userId
  if (!data.userId || typeof data.userId !== 'string') {
    errors.push({ field: 'userId', message: 'User ID is required' });
  } else if (!UUID_REGEX.test(data.userId)) {
    errors.push({ field: 'userId', message: 'Invalid user ID format' });
  } else if (data.userId !== authenticatedUserId && !isAdmin) {
    // Allow admins to generate reports for any user
    errors.push({ field: 'userId', message: 'Cannot generate reports for other users' });
  }

  // Validate startDate
  if (!data.startDate || typeof data.startDate !== 'string') {
    errors.push({ field: 'startDate', message: 'Start date is required' });
  } else if (!DATE_REGEX.test(data.startDate)) {
    errors.push({ field: 'startDate', message: 'Invalid start date format (expected YYYY-MM-DD)' });
  } else if (isNaN(Date.parse(data.startDate))) {
    errors.push({ field: 'startDate', message: 'Invalid start date' });
  }

  // Validate endDate
  if (!data.endDate || typeof data.endDate !== 'string') {
    errors.push({ field: 'endDate', message: 'End date is required' });
  } else if (!DATE_REGEX.test(data.endDate)) {
    errors.push({ field: 'endDate', message: 'Invalid end date format (expected YYYY-MM-DD)' });
  } else if (isNaN(Date.parse(data.endDate))) {
    errors.push({ field: 'endDate', message: 'Invalid end date' });
  }

  // Validate reportType
  const validTypes = ['behavioral', 'comprehensive', 'progress', 'clinical', 'pedagogical', 'familiar'];
  if (!data.reportType || typeof data.reportType !== 'string') {
    errors.push({ field: 'reportType', message: 'Report type is required' });
  } else if (!validTypes.includes(data.reportType)) {
    errors.push({ 
      field: 'reportType', 
      message: `Report type must be one of: ${validTypes.join(', ')}` 
    });
  }

  // Cross-field validations (only if individual fields are valid)
  if (data.startDate && data.endDate && !errors.some(e => e.field === 'startDate' || e.field === 'endDate')) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    
    if (start >= end) {
      errors.push({ field: 'endDate', message: 'End date must be after start date' });
    }
    
    // Check maximum range (1 year)
    const maxRange = 365 * 24 * 60 * 60 * 1000;
    if ((end.getTime() - start.getTime()) > maxRange) {
      errors.push({ field: 'endDate', message: 'Date range cannot exceed 1 year' });
    }
    
    // Check future dates
    const now = new Date();
    if (end > now) {
      errors.push({ field: 'endDate', message: 'End date cannot be in the future' });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
