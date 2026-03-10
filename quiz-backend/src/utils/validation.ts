import { z } from 'zod'


export const AuthCodeSchema = z.object({
    code: z.string().min(1, "Code is required")
})

export type AuthCodeInput = z.infer<typeof AuthCodeSchema>


export interface GitHubUser {
    id: number
    login: string
    name: string | null
    email: string | null
}

export interface GitHubEmail {
    email: string
    primary: boolean
    verified: boolean
    visibility: string | null
}


export interface JWTPayload {
    userId: string
    email: string
    exp?: number
    role: string
    [key: string]: unknown
}