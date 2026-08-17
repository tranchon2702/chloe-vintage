export class ApiError extends Error {
  readonly statusCode: number;
  readonly details?: unknown;
  readonly operational: boolean;

  constructor(statusCode: number, message: string, details?: unknown, operational = true) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.operational = operational;
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', details?: unknown) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Not found') {
    return new ApiError(404, message);
  }

  static unprocessable(message = 'Validation failed', details?: unknown) {
    return new ApiError(422, message, details);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message, undefined, false);
  }
}
