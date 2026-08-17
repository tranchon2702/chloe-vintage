import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(ApiError.notFound(`Route not found: ${request.method} ${request.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: unknown;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error instanceof ZodError) {
    statusCode = 422;
    message = 'Validation failed';
    details = error.flatten().fieldErrors;
  } else if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    typeof error.status === 'number'
  ) {
    statusCode = error.status;
    message = statusCode === 413 ? 'Uploaded file is too large' : 'Request failed';
  }

  const requestId = response.locals.requestId as string | undefined;
  const logMeta = {
    requestId,
    method: request.method,
    path: request.originalUrl,
    statusCode,
    error: error instanceof Error ? error.message : String(error),
  };

  if (statusCode >= 500) {
    logger.error('Request failed', logMeta);
  } else {
    logger.warn('Request rejected', logMeta);
  }

  response.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(requestId ? { requestId } : {}),
    ...(env.isDevelopment && statusCode >= 500 && error instanceof Error
      ? { stack: error.stack }
      : {}),
  });
};
