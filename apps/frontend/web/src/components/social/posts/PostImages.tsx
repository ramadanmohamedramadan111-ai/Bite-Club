'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { PostType } from '@/types/social/posts';

interface PostImagesProps {
  post: PostType;
  className?: string;
  imageClassName?: string;
  showCounter?: boolean;
  imageHref?: string;
}

export function PostImages({
  post,
  className,
  imageClassName = 'aspect-square',
  showCounter = true,
  imageHref,
}: PostImagesProps) {
  const images = (post.images || [])
    .sort((a, b) => a.position - b.position)
    .map((img) => img.image_url)
    .filter((url): url is string => !!url);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [post.id]);

  useEffect(() => {
    if (activeIndex > images.length - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, images.length]);

  if (images.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-sm text-muted-foreground',
          imageClassName,
          className,
        )}
      >
        No images
      </div>
    );
  }

  const hasMultiple = images.length > 1;
  const currentImage = images[activeIndex] ?? images[0];

  const goToPrevious = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveIndex((index) => (index === 0 ? images.length - 1 : index - 1));
  };

  const goToNext = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveIndex((index) => (index === images.length - 1 ? 0 : index + 1));
  };

  const goToIndex = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveIndex(index);
  };

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      <div className={cn('relative z-0 w-full', imageClassName)}>
        <Image
          src={currentImage}
          alt={`${post.caption} - image ${activeIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={activeIndex === 0}
        />

        {imageHref && (
          <Link
            href={imageHref}
            className="absolute inset-0 z-1"
            aria-label="View post"
          />
        )}
      </div>

      {hasMultiple && showCounter && (
        <div className="pointer-events-none absolute left-2 top-2 z-20 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
          {activeIndex + 1}/{images.length}
        </div>
      )}

      {hasMultiple && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white shadow-sm transition-colors hover:bg-black/75"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label="Next image"
            className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white shadow-sm transition-colors hover:bg-black/75"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="pointer-events-none absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                aria-label={`Show image ${index + 1}`}
                className={cn(
                  'pointer-events-auto h-1.5 w-1.5 rounded-full transition-colors',
                  index === activeIndex ? 'bg-white' : 'bg-white/50',
                )}
                onClick={(event) => goToIndex(event, index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
