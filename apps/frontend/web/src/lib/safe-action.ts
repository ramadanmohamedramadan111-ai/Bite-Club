import { createSafeActionClient } from 'next-safe-action';
import { AppError } from './errors/app-error';

export type ServerError = {
  status: number;
  data: {
    errors?: Record<string, string[]>;
  } | null;
  message: string;
};

export const actionClient = createSafeActionClient({
  handleServerError(error): ServerError {
    if (error instanceof AppError) {
      return {
        status: error.status,
        data: error.data as ServerError['data'],
        message: error.message,
      };
    }

    return {
      status: 500,
      data: null,
      message: 'Something went wrong',
    };
  },
});

