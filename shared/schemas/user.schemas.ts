import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export const userSchema = z.object({
  _id: z.string(),
  email: z.email(),
})

export const authResponseSchema = z.object({
  user: userSchema,
  accessToken: z.string(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type User = z.infer<typeof userSchema>
export type AuthResponse = z.infer<typeof authResponseSchema>
