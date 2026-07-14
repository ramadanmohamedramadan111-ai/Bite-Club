export type AppErrorData = {
  code?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
};

export class AppError extends Error {
  constructor(
    public status: number,
    public data: AppErrorData | null = null,
    message = 'Something went wrong',
  ) {
    super(message);

    this.name = 'AppError';
  }
}
