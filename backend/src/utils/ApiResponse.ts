import type { Response } from 'express';

interface SuccessOptions<T> {
  data: T;
  message?: string;
  statusCode?: number;
  meta?: Record<string, unknown>;
}

export const sendSuccess = <T>(
  response: Response,
  { data, message = 'OK', statusCode = 200, meta }: SuccessOptions<T>,
) =>
  response.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });

export const sendCreated = <T>(response: Response, data: T, message = 'Created') =>
  sendSuccess(response, { data, message, statusCode: 201 });
