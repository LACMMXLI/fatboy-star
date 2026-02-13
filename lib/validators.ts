import { z } from "zod";

export const reviewSchema = z.object({
  branch: z.enum(["venecia", "sanmarcos"]),
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional().transform(v => v?.trim() || null),
  source: z.string().default("direct"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const noteSchema = z.object({
  note: z.string().min(1).max(1000).trim(),
});

export const patchReviewSchema = z.object({
  status: z.enum(["pending", "in_progress", "resolved"]).optional(),
  priority: z.enum(["normal", "high"]).optional(),
});
