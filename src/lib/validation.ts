import { z } from 'zod';

// Authentication validation schemas
export const authSchemas = {
  email: z.string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must be less than 128 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "Password must contain uppercase, lowercase, and number"
    }),
  
  name: z.string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" })
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
      message: "Name can only contain letters, spaces, hyphens, and apostrophes"
    })
};

// Sign in validation
export const signInSchema = z.object({
  email: authSchemas.email,
  password: z.string().min(1, { message: "Password is required" })
});

// Sign up validation
export const signUpSchema = z.object({
  email: authSchemas.email,
  password: authSchemas.password,
  name: authSchemas.name
});

// Clinical report validation
export const clinicalReportSchema = z.object({
  userId: z.string().uuid({ message: "Invalid user ID" }),
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format (YYYY-MM-DD)" })
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date"
    }),
  endDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format (YYYY-MM-DD)" })
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date"
    }),
  reportType: z.enum(['behavioral', 'comprehensive', 'progress'], {
    errorMap: () => ({ message: "Report type must be behavioral, comprehensive, or progress" })
  })
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start < end;
}, {
  message: "Start date must be before end date",
  path: ["endDate"]
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
  return (end.getTime() - start.getTime()) <= maxRange;
}, {
  message: "Date range cannot exceed 1 year",
  path: ["endDate"]
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ClinicalReportInput = z.infer<typeof clinicalReportSchema>;
