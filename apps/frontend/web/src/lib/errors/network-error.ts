import { AppError } from './app-error';

export class NetworkError extends AppError {
  constructor(message: string) {
    super(0, null, message);

    this.name = 'NetworkError';
  }
}
