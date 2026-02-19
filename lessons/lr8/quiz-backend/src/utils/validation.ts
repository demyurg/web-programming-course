import { z } from 'zod';

export const GitHubCallbackSchema = z.object({
  code: z.string().trim().min(1, "code is required"),
});

export type GitHubCallbackInput = z.infer<typeof GitHubCallbackSchema>;
