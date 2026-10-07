import { z } from 'zod';

export const StudioPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sort: z
    .enum(['engagement', 'likes', 'comments', 'saves', 'views', 'newest'])
    .default('engagement'),
});

export type StudioPostsQuery = z.infer<typeof StudioPostsQuerySchema>;
