import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { env } from '../../config/env.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ContactRepository } from './contact.repository.js';
import { createContactController } from './contact.controller.js';
import { createContactSchema } from './contact.schema.js';
import { ContactService } from './contact.service.js';

export const createContactRouter = (storageFile = env.contactStorageFile) => {
  const router = Router();
  const repository = new ContactRepository(storageFile);
  const service = new ContactService(repository);
  const controller = createContactController(service);

  const contactRateLimiter = rateLimit({
    windowMs: env.CONTACT_RATE_LIMIT_WINDOW_MS,
    limit: env.CONTACT_RATE_LIMIT_MAX,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_request, response) => {
      response.status(429).json({
        success: false,
        message: 'Too many messages. Please try again in a few minutes.',
      });
    },
  });

  router.post(
    '/',
    contactRateLimiter,
    validate(createContactSchema),
    asyncHandler(controller.create),
  );

  return router;
};
