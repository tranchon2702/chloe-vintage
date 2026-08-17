import { randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import express, { Router, type RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import type { ContentRepository } from '../content/content.repository.js';
import { managedContentSchema, type ManagedContent } from '../content/content.schema.js';

const loginSchema = z.object({
  password: z.string().min(1).max(256),
});

const uploadSlotSchema = z.object({
  slot: z.enum([
    'hero',
    'journey',
    'archive-plant',
    'archive-reading',
    'archive-travel',
    'archive-cover',
    'archive-denim-one',
    'archive-denim-two',
    'social',
  ]),
});

interface CreateAdminRouterOptions {
  repository: ContentRepository;
  mediaDirectory: string;
  password: string;
}

const passwordsMatch = (candidate: string, expected: string) => {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  return (
    candidateBuffer.length === expectedBuffer.length &&
    timingSafeEqual(candidateBuffer, expectedBuffer)
  );
};

const detectImageExtension = (buffer: Buffer) => {
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    return 'png';
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpg';
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }
  return null;
};

export const createAdminRouter = ({
  repository,
  mediaDirectory,
  password,
}: CreateAdminRouterOptions) => {
  const router = Router();
  const sessions = new Map<string, number>();
  const sessionDurationMs = env.ADMIN_SESSION_HOURS * 60 * 60 * 1_000;

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1_000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_request, response) => {
      response.status(429).json({
        success: false,
        message: 'Too many login attempts. Please wait 15 minutes.',
      });
    },
  });

  const requireSession: RequestHandler = (request, _response, next) => {
    const authorization = request.get('authorization');
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
    const expiresAt = token ? sessions.get(token) : undefined;

    if (!expiresAt || expiresAt <= Date.now()) {
      if (token) sessions.delete(token);
      next(ApiError.unauthorized('Admin session is missing or expired'));
      return;
    }

    next();
  };

  router.post('/login', loginLimiter, validate(loginSchema), (request, response, next) => {
    const candidate = (request.body as z.infer<typeof loginSchema>).password;
    if (!passwordsMatch(candidate, password)) {
      next(ApiError.unauthorized('Incorrect password'));
      return;
    }

    const token = randomBytes(32).toString('base64url');
    const expiresAt = Date.now() + sessionDurationMs;
    sessions.set(token, expiresAt);
    sendSuccess(response, { data: { token, expiresAt: new Date(expiresAt).toISOString() } });
  });

  router.use(requireSession);

  router.post('/logout', (request, response) => {
    const authorization = request.get('authorization');
    if (authorization?.startsWith('Bearer ')) sessions.delete(authorization.slice(7));
    sendSuccess(response, { data: { loggedOut: true } });
  });

  router.get(
    '/content',
    asyncHandler(async (_request, response) => {
      const document = await repository.read();
      return sendSuccess(response, {
        data: document ?? { content: null, updatedAt: null },
      });
    }),
  );

  router.put(
    '/content',
    validate(managedContentSchema),
    asyncHandler(async (request, response) => {
      const document = await repository.save(request.body as ManagedContent);
      return sendSuccess(response, {
        data: document,
        message: 'Content saved',
      });
    }),
  );

  router.put(
    '/media/:slot',
    validate(uploadSlotSchema, 'params'),
    express.raw({
      type: ['image/jpeg', 'image/png', 'image/webp'],
      limit: '8mb',
    }),
    asyncHandler(async (request, response) => {
      if (!Buffer.isBuffer(request.body) || request.body.length === 0) {
        throw ApiError.badRequest('Please select a JPG, PNG or WebP image.');
      }

      const extension = detectImageExtension(request.body);
      if (!extension) {
        throw ApiError.badRequest('The uploaded file is not a valid JPG, PNG or WebP image.');
      }

      const slot = request.params.slot;
      const filename = `${slot}-${Date.now()}.${extension}`;
      await mkdir(mediaDirectory, { recursive: true });
      await writeFile(resolve(mediaDirectory, filename), request.body, { flag: 'wx' });

      return sendSuccess(response, {
        data: {
          path: `${env.API_PREFIX}/content/media/${filename}`,
        },
        message: 'Image uploaded',
      });
    }),
  );

  return router;
};
