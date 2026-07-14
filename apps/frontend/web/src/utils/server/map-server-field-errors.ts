import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

type ServerValidationErrors<T extends FieldValues> = Partial<
  Record<Path<T>, string[]>
>;

export function mapServerFieldErrors<T extends FieldValues>(
  errors: ServerValidationErrors<T>,
  setError: UseFormSetError<T>,
) {
  Object.entries(errors).forEach(([field, messages]) => {
    if (!Array.isArray(messages) || messages.length === 0) return;

    setError(field as Path<T>, {
      type: 'server',
      message: messages[0],
    });
  });
}
