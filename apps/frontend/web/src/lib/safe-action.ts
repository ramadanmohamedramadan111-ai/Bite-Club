import { createSafeActionClient } from 'next-safe-action';
import { AppError } from './errors/app-error';

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    if (error instanceof AppError) {
      return {
        status: error.status,
        data: error.data,
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
