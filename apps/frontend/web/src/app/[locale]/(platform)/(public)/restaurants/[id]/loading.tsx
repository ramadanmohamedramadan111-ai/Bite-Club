import { Spinner } from '@/components/ui/spinner';

export default function loading() {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <Spinner className="size-8" />
    </div>
  );
}
