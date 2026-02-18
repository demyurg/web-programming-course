import z from 'zod';

export const authCallbackSchema = z.object({
  code: z.string().min(1),
});