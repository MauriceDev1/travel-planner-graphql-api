export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class ExternalAPIError extends APIError {
  constructor(service: string, message?: string) {
    super(
      message || `External API error from ${service}`,
      502,
      'EXTERNAL_API_ERROR'
    );
    this.name = 'ExternalAPIError';
  }
}

export default { APIError, NotFoundError, ValidationError, ExternalAPIError };