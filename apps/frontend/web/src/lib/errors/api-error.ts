import { AppError } from './app-error';

export class APIError extends AppError {
  constructor(status: number, data: unknown = null, message?: string) {
    super(
      status,
      data,
      message ??
        (typeof data === 'object' && data !== null && 'message' in data
          ? String(data.message)
          : 'API Error'),
    );

    this.name = 'APIError';
  }
}
