import { Router } from 'express';
import { resolve } from 'node:path';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import type { ContentRepository } from './content.repository.js';

const mediaFilePattern =
  /^(hero|journey|archive-plant|archive-reading|archive-travel|archive-cover|archive-denim-one|archive-denim-two|social)-\d+\.(jpg|png|webp)$/;

export const createContentRouter = (
  repository: ContentRepository,
  mediaDirectory: string,
) => {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (_request, response) => {
      const document = await repository.read();
      return sendSuccess(response, {
        data: document ?? { content: null, updatedAt: null },
      });
    }),
  );

  router.get('/media/:file', (request, response, next) => {
    const file = request.params.file;
    if (!file || !mediaFilePattern.test(file)) {
      next(ApiError.notFound('Image not found'));
      return;
    }

    response.setHeader('cache-control', 'public, max-age=31536000, immutable');
    response.sendFile(resolve(mediaDirectory, file), (error) => {
      if (error) next(ApiError.notFound('Image not found'));
    });
  });

  return router;
};
