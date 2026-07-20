'use client';

import { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { RestaurantCategory } from '@/types/restaurant/restaurant';
import { ChevronLeft, ChevronRight, Utensils } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

type Props = {
  categories: RestaurantCategory[];
};

export default function HomeCategoriesScroll({ categories }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftBtn(scrollLeft > 5);
      setShowRightBtn(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      checkScroll();
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);

      // A small delay to let items render and recalculate
      const timer = setTimeout(checkScroll, 300);

      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
        clearTimeout(timer);
      };
    }
  }, [categories]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75; // Scroll 75% of container width
      scrollRef.current.scrollTo({
        left:
          direction === 'left'
            ? scrollLeft - scrollAmount
            : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="group/scroll relative w-full">
      {/* Left scroll button */}
      {showLeftBtn && (
        <Button
          variant="outline"
          size="icon"
          className="absolute -left-4 top-10 z-10 size-10 -translate-y-1/2 rounded-full border-muted bg-background/80 shadow-md backdrop-blur-xs transition-all hover:bg-background hover:scale-105 active:scale-95"
          onClick={() => handleScroll('left')}
          aria-label="Scroll left">
          <ChevronLeft className="size-5" />
        </Button>
      )}

      {/* Right scroll button */}
      {showRightBtn && (
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-4 top-10 z-10 size-10 -translate-y-1/2 rounded-full border-muted bg-background/80 shadow-md backdrop-blur-xs transition-all hover:bg-background hover:scale-105 active:scale-95"
          onClick={() => handleScroll('right')}
          aria-label="Scroll right">
          <ChevronRight className="size-5" />
        </Button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="no-scrollbar flex gap-6 overflow-x-auto scroll-smooth pb-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/restaurants?category=${encodeURIComponent(category.slug)}`}
            className="group flex w-24 shrink-0 flex-col items-center gap-2 text-center">
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-primary/10 transition group-hover:bg-primary/20 group-hover:shadow-md group-hover:scale-105 duration-200">
              {category.image_url ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${category.image_url}`}
                  alt={category.name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                />
              ) : (
                <Utensils className="size-8 text-primary transition duration-300 group-hover:scale-110" />
              )}
            </div>

            <span className="w-full text-center text-sm font-medium leading-tight break-words transition duration-200 group-hover:text-primary">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

