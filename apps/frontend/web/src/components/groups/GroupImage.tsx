import { Users } from 'lucide-react';

import { cn } from '@/lib/utils';

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
};

export default function GroupImage({
  src,
  alt,
  className,
  fallbackClassName,
}: Props) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={cn('object-cover', className)} />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-muted',
        fallbackClassName ?? className,
      )}>
      <Users className="size-6 text-muted-foreground" />
    </div>
  );
}
