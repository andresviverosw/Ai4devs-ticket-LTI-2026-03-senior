import { z } from 'zod';

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

export const educationRowSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  startDate: isoDate,
  endDate: isoDate.optional().nullable(),
});

export const experienceRowSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  startDate: isoDate,
  endDate: isoDate.optional().nullable(),
  description: z.string().optional().nullable(),
});

export const candidateCreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1).email('Invalid email format'),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  education: z.array(educationRowSchema).default([]),
  experience: z.array(experienceRowSchema).default([]),
});

export type CandidateCreateInput = z.infer<typeof candidateCreateSchema>;
