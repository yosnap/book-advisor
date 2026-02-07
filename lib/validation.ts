import { z } from 'zod'

export const MoodSchema = z.enum(['feliz', 'triste', 'reflexivo', 'ansioso', 'neutral'])
export const ProfileSchema = z.enum(['novato', 'intermedio', 'avanzado', 'experto'])
export const IntentSchema = z.enum(['relax', 'aprendizaje', 'evasión'])
export const DifficultySchema = z.enum(['beginner', 'intermediate', 'advanced'])

export const ContextSchema = z.object({
  mood: MoodSchema,
  profile: ProfileSchema,
  interests: z.array(z.string()).default([]),
  intent: IntentSchema,
})

export const RecommendationRequestSchema = z.object({
  userId: z.string().uuid().optional(),
  context: ContextSchema,
})

export const BooksQuerySchema = z.object({
  genre: z.string().optional(),
  difficulty: DifficultySchema.optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export type Mood = z.infer<typeof MoodSchema>
export type Profile = z.infer<typeof ProfileSchema>
export type Intent = z.infer<typeof IntentSchema>
export type Difficulty = z.infer<typeof DifficultySchema>
export type Context = z.infer<typeof ContextSchema>
export type RecommendationRequest = z.infer<typeof RecommendationRequestSchema>
export type BooksQuery = z.infer<typeof BooksQuerySchema>
