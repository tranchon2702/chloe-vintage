import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import compression from 'compression';
import cors from 'cors';
import express, { type Application } from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { createApiRouter } from './routes/index.js';
import { ApiError } from './utils/ApiError.js';

export interface CreateAppOptions {
  contactStorageFile?: string;
  contentStorageFile?: string;
  contentMediaDirectory?: string;
  adminPassword?: string;
  frontendDist?: string;
  serveFrontend?: boolean;
  logRequests?: boolean;
}

export const createApp = ({
  contactStorageFile,
  contentStorageFile,
  contentMediaDirectory,
  adminPassword,
  frontendDist = resolve(process.cwd(), '../frontend/dist'),
  serveFrontend = env.SERVE_FRONTEND,
  logRequests = !env.isTest,
}: CreateAppOptions = {}): Application => {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use((request, response, next) => {
    const requestId = request.get('x-request-id') || randomUUID();
    response.locals.requestId = requestId;
    response.setHeader('x-request-id', requestId);

    if (logRequests) {
      const startedAt = Date.now();
      response.on('finish', () => {
        logger.info('HTTP request', {
          requestId,
          method: request.method,
          path: request.originalUrl,
          statusCode: response.statusCode,
          durationMs: Date.now() - startedAt,
        });
      });
    }

    next();
  });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'", ...env.corsOrigins],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: env.isProduction ? [] : null,
        },
      },
      crossOriginResourcePolicy: { policy: 'same-origin' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  app.use(compression());
  app.use(express.json({ limit: '256kb' }));
  app.use(express.urlencoded({ extended: false, limit: '32kb' }));

  const apiCors = cors((request, callback) => {
    const origin = request.headers.origin;
    const forwardedHostHeader = request.headers['x-forwarded-host'];
    const forwardedHost = Array.isArray(forwardedHostHeader)
      ? forwardedHostHeader[0]
      : forwardedHostHeader?.split(',')[0]?.trim();
    const requestHost = forwardedHost || request.headers.host;
    let originHost = '';

    if (origin) {
      try {
        originHost = new URL(origin).host;
      } catch {
        originHost = '';
      }
    }

    const isAllowed =
      !origin || originHost === requestHost || env.corsOrigins.includes(origin);

    if (!isAllowed) {
      callback(ApiError.forbidden('Origin is not allowed by CORS'));
      return;
    }

    callback(null, {
      origin: origin || false,
      methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
      credentials: false,
    });
  });

  app.use(
    env.API_PREFIX,
    apiCors,
    createApiRouter({
      contactStorageFile,
      contentStorageFile,
      contentMediaDirectory,
      adminPassword,
    }),
  );
  app.use(env.API_PREFIX, notFoundHandler);

  app.get('/robots.txt', (_request, response) => {
    response.type('text/plain').send(
      ['User-agent: *', 'Allow: /', 'Disallow: /api/', '', `Sitemap: ${env.SITE_URL}/sitemap.xml`].join(
        '\n',
      ),
    );
  });

  app.get('/sitemap.xml', (_request, response) => {
    response.type('application/xml').send(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '  <url>',
        `    <loc>${env.SITE_URL}/</loc>`,
        '    <changefreq>monthly</changefreq>',
        '    <priority>1.0</priority>',
        '  </url>',
        '</urlset>',
      ].join('\n'),
    );
  });

  if (serveFrontend && existsSync(frontendDist)) {
    app.use(
      express.static(frontendDist, {
        index: false,
        dotfiles: 'deny',
        maxAge: env.isProduction ? '1h' : 0,
        setHeaders: (response, filePath) => {
          if (filePath.endsWith('index.html')) {
            response.setHeader('cache-control', 'no-cache');
          }
        },
      }),
    );

    app.get(['/admin', '/admin/'], (_request, response) => {
      response.setHeader('cache-control', 'no-cache');
      response.sendFile(resolve(frontendDist, 'admin.html'));
    });

    app.get('*', (request, response, next) => {
      if (request.method !== 'GET' || request.path.startsWith('/api/')) {
        next();
        return;
      }
      response.setHeader('cache-control', 'no-cache');
      response.sendFile(resolve(frontendDist, 'index.html'));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
