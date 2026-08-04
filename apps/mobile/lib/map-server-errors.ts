import type { Path, UseFormSetError } from 'react-hook-form';

export function mapServerFieldErrors<T extends Record<string, unknown>>(
  errors: Record<string, string[]> | undefined,
  setError: UseFormSetError<T>,
) {
  if (!errors) return;
  for (const [field, messages] of Object.entries(errors)) {
    const message = messages?.[0];
    if (!message) continue;
    setError(field as Path<T>, { type: 'server', message });
  }
}
