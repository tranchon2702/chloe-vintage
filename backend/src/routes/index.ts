import { Router } from 'express';
import { env } from '../config/env.js';
import { createAdminRouter } from '../modules/admin/admin.routes.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { createContactRouter } from '../modules/contact/contact.routes.js';
import { ContentRepository } from '../modules/content/content.repository.js';
import { createContentRouter } from '../modules/content/content.routes.js';

const profile = {
  name: 'Chloe',
  birthDate: '2000-11-14',
  role: 'Sales · Advisor & relationship builder',
  email: 'hello@chloe.studio',
  palette: ['#F4EDDC', '#C9876B', '#B7CCD0', '#5B2B32', '#A47B46', '#241D1B'],
  interests: ['Human connection', 'Customer insight', 'Quiet living'],
};

const focusAreas = [
  {
    id: 'listen',
    title: 'Listen before offering',
    type: 'Relationship-led sales approach',
  },
  {
    id: 'translate',
    title: 'Communicate value clearly',
    type: 'Value-based selling',
  },
  {
    id: 'grow',
    title: 'Nurture long-term growth',
    type: 'Partner relationship care',
  },
];

interface CreateApiRouterOptions {
  contactStorageFile?: string;
  contentStorageFile?: string;
  contentMediaDirectory?: string;
  adminPassword?: string;
}

export const createApiRouter = ({
  contactStorageFile,
  contentStorageFile = env.contentStorageFile,
  contentMediaDirectory = env.contentMediaDirectory,
  adminPassword = env.ADMIN_PASSWORD,
}: CreateApiRouterOptions = {}) => {
  const router = Router();
  const contentRepository = new ContentRepository(contentStorageFile);

  router.get('/health', (_request, response) => {
    sendSuccess(response, {
      data: {
        service: 'chloe-web-vintage-api',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
      },
    });
  });

  router.get('/profile', (_request, response) => {
    sendSuccess(response, { data: profile });
  });

  router.get('/projects', (_request, response) => {
    sendSuccess(response, { data: focusAreas });
  });

  router.use('/content', createContentRouter(contentRepository, contentMediaDirectory));
  router.use(
    '/admin',
    createAdminRouter({
      repository: contentRepository,
      mediaDirectory: contentMediaDirectory,
      password: adminPassword,
    }),
  );
  router.use('/contact', createContactRouter(contactStorageFile));

  return router;
};
