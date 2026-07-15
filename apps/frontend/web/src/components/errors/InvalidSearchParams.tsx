import { AlertCircle } from 'lucide-react';

export default function InvalidSearchParams() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center">
      <AlertCircle className="size-12 text-destructive" />

      <h2 className="text-xl font-semibold">Invalid URL parameters</h2>

      <p className="max-w-md text-muted-foreground">
        The URL contains invalid or unsupported query parameters. Please
        navigate using the application or check the URL.
      </p>
    </div>
  );
}
