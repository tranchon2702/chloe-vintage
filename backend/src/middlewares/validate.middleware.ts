import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { ApiError } from '../utils/ApiError.js';

type RequestTarget = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodTypeAny, target: RequestTarget = 'body') =>
  (request: Request, _response: Response, next: NextFunction) => {
    const result = schema.safeParse(request[target]);

    if (!result.success) {
      next(ApiError.unprocessable('Validation failed', result.error.flatten().fieldErrors));
      return;
    }

    Object.assign(request[target], result.data);
    next();
  };
