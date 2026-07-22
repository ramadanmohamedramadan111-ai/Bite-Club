'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-8">
      <Card className="w-full max-w-lg overflow-hidden">
        <CardHeader className="space-y-6 pb-4 text-center">
          <div className="mx-auto flex size-24 items-center justify-center rounded-full border bg-destructive/10">
            <AlertTriangle className="size-10 text-destructive" />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Group Invitation
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              Unable to Join Group
            </h1>

            <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground">
              {error.message ||
                'This invitation is no longer valid, has expired, or you do not have permission to join this group.'}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/30 p-5 text-center">
            <p className="text-sm text-muted-foreground">
              If you believe this is a mistake, ask the group owner to send you
              a new invitation.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 size-4" />
              Go Back
            </Button>

            <Button onClick={reset}>
              <RefreshCw className="mr-2 size-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
