import { z } from 'zod';

export const UpdateUserProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60).optional(),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  bio: z.string().trim().max(300, 'Bio cannot exceed 300 characters').optional().nullable(),
  location: z.string().trim().max(100, 'Location cannot exceed 100 characters').optional().nullable(),
  website: z.string().url('Must be a valid URL').optional().nullable(),
  interests: z.array(z.string().trim().max(50)).max(10, 'Maximum 10 interests allowed').optional(),
});

export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;
