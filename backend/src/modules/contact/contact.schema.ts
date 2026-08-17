import { z } from 'zod';

const compactText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .transform((value) => value.replace(/\s+/g, ' '));

export const createContactSchema = z.object({
  name: compactText(80).pipe(z.string().min(2, 'Please enter at least 2 characters.')),
  email: z.string().trim().email('Please enter a valid email address.').max(160).toLowerCase(),
  subject: compactText(160)
    .optional()
    .transform((value) => value || undefined),
  message: compactText(3000).pipe(z.string().min(10, 'Please enter at least 10 characters.')),
  website: z.string().trim().max(240).optional(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
