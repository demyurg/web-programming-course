import { z } from 'zod'

export const githubCodeSchema = z.object({
  code: z.string().min(1)
})

export type GithubCodeInput = z.infer<typeof githubCodeSchema>