import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';

export const CreateProjectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Project title must be at least 3 characters')
    .max(100, 'Project title cannot exceed 100 characters'),
  description: z
    .string()
    .trim()
    .min(10, 'Project description must be at least 10 characters')
    .max(3000, 'Project description cannot exceed 3000 characters'),
  fundingGoal: z
    .number({ invalid_type_error: 'Funding goal must be a number' })
    .int('Funding goal must be an integer')
    .min(500, 'Funding goal must be at least 500 ArtCredits')
    .refine((val) => val % 500 === 0, {
      message: 'Funding goal must be a multiple of 500 ArtCredits',
    }),
  totalShares: z
    .number({ invalid_type_error: 'Total shares must be a number' })
    .int('Total shares must be an integer')
    .min(100, 'Total shares must be at least 100')
    .max(1000000, 'Total shares cannot exceed 1,000,000')
    .default(10000)
    .optional(),
  categoryId: z.string().trim().cuid('Invalid category ID').optional().nullable(),
  coverMediaUrl: z.string().trim().url('Cover media must be a valid URL').optional().nullable(),
  deadline: z
    .string({ required_error: 'Funding deadline is required' })
    .datetime({ message: 'Invalid deadline format' })
    .refine((val) => new Date(val).getTime() > Date.now(), {
      message: 'Funding deadline must be in the future',
    }),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export const InvestProjectSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Investment amount must be a number' })
    .int('Investment amount must be an integer')
    .min(500, 'Investments must be at least 500 ArtCredits')
    .refine((val) => val % 500 === 0, {
      message: 'Investments must be in multiples of 500 ArtCredits',
    }),
});

export type InvestProjectInput = z.infer<typeof InvestProjectSchema>;

export const ProjectQuerySchema = z.object({
  status: z.nativeEnum(ProjectStatus).optional(),
  category: z.string().trim().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type ProjectQuery = z.infer<typeof ProjectQuerySchema>;
