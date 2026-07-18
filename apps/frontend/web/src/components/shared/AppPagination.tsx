'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';

type AppPaginationProps = {
  currentPage: number;
  totalPages: number;
};

export default function AppPagination({
  currentPage,
  totalPages,
}: AppPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Always have at least one page.
  const pages = Math.max(totalPages, 1);

  function navigate(page: number) {
    const params = new URLSearchParams(searchParams);

    params.set('page', page.toString());

    router.push(`${pathname}?${params.toString()}`);
  }

  function getPages() {
    if (pages <= 7) {
      return Array.from({ length: pages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', pages] as const;
    }

    if (currentPage >= pages - 3) {
      return [
        1,
        '...',
        pages - 4,
        pages - 3,
        pages - 2,
        pages - 1,
        pages,
      ] as const;
    }

    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      pages,
    ] as const;
  }

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();

              if (currentPage > 1) {
                navigate(currentPage - 1);
              }
            }}
          />
        </PaginationItem>

        {getPages().map((page, index) =>
          page === '...' ? (
            <PaginationItem key={index}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(page);
                }}>
                {page}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();

              if (currentPage < pages) {
                navigate(currentPage + 1);
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
