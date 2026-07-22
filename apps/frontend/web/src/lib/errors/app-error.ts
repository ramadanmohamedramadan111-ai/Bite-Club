export class AppError extends Error {
  constructor(
    public status: number,
    public data: unknown = null,
    message = 'Something went wrong',
  ) {
    super(message);

    this.name = 'AppError';
  }
}
