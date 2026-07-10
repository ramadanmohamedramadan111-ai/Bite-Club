'use client';
import { RefreshCw } from 'lucide-react';
import { Spinner } from '../ui/spinner';

interface QueryBoundaryProps {
  isPending: boolean;
  error: Error | null;
  refetch: () => void;
  children: React.ReactNode;
}

export function QueryBoundary({
  isPending,
  error,
  refetch,
  children,
}: QueryBoundaryProps) {
  if (isPending) {
    return <Spinner className="size-6" />;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2">
        Failed to load
        <button type="button" onClick={() => refetch()}>
          <RefreshCw />
        </button>
      </div>
    );
  }

  return children;
}

