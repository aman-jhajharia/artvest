import { z } from 'zod';
import { InquiryStatus } from '@prisma/client';

export const CreateCommentSchema = z.object({
  content: z
    .string({ required_error: 'Comment content is required' })
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment cannot exceed 2000 characters'),
  parentId: z.string().trim().optional().nullable(),
});

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;

export const UpdateCommentSchema = z.object({
  content: z
    .string({ required_error: 'Updated content is required' })
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment cannot exceed 2000 characters'),
});

export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>;

export const CommentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CommentsQueryInput = z.infer<typeof CommentsQuerySchema>;

export const SavedPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type SavedPostsQueryInput = z.infer<typeof SavedPostsQuerySchema>;

export const FollowQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type FollowQueryInput = z.infer<typeof FollowQuerySchema>;

export const CreateInquirySchema = z.object({
  recipientId: z.string({ required_error: 'Recipient identifier is required' }).trim().min(1),
  postId: z.string().trim().optional().nullable(),
  message: z
    .string({ required_error: 'Collaboration message is required' })
    .trim()
    .min(5, 'Message must be at least 5 characters long')
    .max(3000, 'Message cannot exceed 3000 characters'),
});

export type CreateInquiryInput = z.infer<typeof CreateInquirySchema>;

export const UpdateInquiryStatusSchema = z.object({
  status: z.nativeEnum(InquiryStatus, {
    errorMap: () => ({ message: 'Status must be ACCEPTED, DECLINED, or WITHDRAWN' }),
  }),
});

export type UpdateInquiryStatusInput = z.infer<typeof UpdateInquiryStatusSchema>;

export const InquiriesQuerySchema = z.object({
  status: z.nativeEnum(InquiryStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type InquiriesQueryInput = z.infer<typeof InquiriesQuerySchema>;
