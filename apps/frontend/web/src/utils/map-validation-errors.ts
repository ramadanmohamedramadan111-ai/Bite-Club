import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

type ZodFormattedError<T> = {
  [K in keyof T]?: {
    _errors?: string[];
  };
};

export function mapValidationErrors<T extends FieldValues>(
  errors: ZodFormattedError<T>,
  setError: UseFormSetError<T>,
) {
  Object.entries(errors).forEach(([field, error]) => {
    if (error?._errors?.length) {
      setError(field as Path<T>, {
        type: 'server',
        message: error._errors[0],
      });
    }
  });
}

