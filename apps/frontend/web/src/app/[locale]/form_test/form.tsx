'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Form, useForm } from 'react-hook-form';
import { formSchema, FormValues } from './schema';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { House } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';

export default function FormTest() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { isPending, error, mutate } = useMutation({
    mutationFn: async (data: Post) => {
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/posts',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        throw new Error('Request failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success('Login successful');
    },
    onError: (error) => {
      toast.error('Login failed');
    },
  });

  const onSubmit = (values: FormValues) => {
    mutate(values);
  };
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">
            Email <House />
          </FieldLabel>

          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            disabled={isPending}
            {...form.register('email')}
          />

          <FieldDescription>
            We&apos;ll never share your email with anyone.
          </FieldDescription>

          {form.formState.errors.email && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.email.message}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>

          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            disabled={isPending}
            {...form.register('password')}
          />

          {form.formState.errors.password && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.password.message}
            </p>
          )}
        </Field>

        <Field orientation="horizontal">
          <Button type="reset" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>

          <Button type="submit" disabled={isPending}>
            {/* {form.formState.isSubmitting ? 'Signing in...' : 'Sign In'} */}
            {isPending ? 'Signing in...' : 'Sign In'}
          </Button>
        </Field>
      </FieldGroup>

      {error && (
        <p className="text-sm text-destructive mt-1">
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
      )}
    </form>
  );
}

