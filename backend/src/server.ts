import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const app = createApp();
const server = createServer(app);

server.listen(env.PORT, env.HOST, () => {
  logger.info('Chloe portfolio started', {
    url: `http://${env.HOST}:${env.PORT}`,
    api: env.API_PREFIX,
    frontend: env.SERVE_FRONTEND,
  });
});

const shutdown = (signal: string) => {
  logger.info('Graceful shutdown started', { signal });

  server.close((error) => {
    if (error) {
      logger.error('Graceful shutdown failed', { error: error.message });
      process.exitCode = 1;
      return;
    }

    logger.info('Graceful shutdown complete');
    process.exitCode = 0;
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: String(reason) });
});
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message });
  process.exit(1);
});
