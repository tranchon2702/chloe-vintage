import { z } from 'zod';

const translationDictionary = z
  .record(z.string().min(1).max(120), z.string().max(5_000))
  .refine((value) => Object.keys(value).length > 0, 'At least one translation is required.');

const localImagePath = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine(
    (value) => value.startsWith('/') && !value.startsWith('//'),
    'Images must use a local path beginning with "/".',
  );

export const imageSlotsSchema = z.object({
  hero: localImagePath,
  journey: localImagePath,
  archivePlant: localImagePath,
  archiveReading: localImagePath,
  archiveTravel: localImagePath,
  archiveCover: localImagePath,
  archiveDenimOne: localImagePath,
  archiveDenimTwo: localImagePath,
  social: localImagePath,
});

export const sectionVisibilitySchema = z.object({
  manifesto: z.boolean(),
  approach: z.boolean(),
  organic: z.boolean(),
  cases: z.boolean(),
  journey: z.boolean(),
  archive: z.boolean(),
  about: z.boolean(),
  notes: z.boolean(),
  contact: z.boolean(),
});

const localizedCaseStudySchema = z.object({
  eyebrow: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(220),
  challenge: z.string().trim().min(1).max(1_200),
  approach: z.string().trim().min(1).max(1_800),
  outcome: z.string().trim().min(1).max(1_200),
});

export const caseStudySchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9-]+$/).max(80),
  vi: localizedCaseStudySchema,
  en: localizedCaseStudySchema,
});

export const managedContentSchema = z.object({
  email: z.string().trim().email().max(160),
  translations: z.object({
    vi: translationDictionary,
    en: translationDictionary,
  }),
  images: imageSlotsSchema,
  sections: sectionVisibilitySchema,
  caseStudies: z.array(caseStudySchema).max(8),
});

export type ManagedContent = z.infer<typeof managedContentSchema>;
