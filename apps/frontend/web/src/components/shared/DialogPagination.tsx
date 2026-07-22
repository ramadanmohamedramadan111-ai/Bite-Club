'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import { useTranslations, useLocale } from 'next-intl';
import { getLangDir } from 'rtl-detect';

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function DialogPagination({
  currentPage,
  totalPages,
  onPageChange,
}: Props) {
  const t = useTranslations('pagination');
  const locale = useLocale();
  const direction = getLangDir(locale);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination dir={direction}>
      <PaginationContent className="w-full justify-between">
        <PaginationItem>
          <PaginationPrevious
            text={t('previous')}
            href="#"
            aria-disabled={currentPage === 1}
            className={
              currentPage === 1
                ? 'pointer-events-none opacity-50'
                : 'cursor-pointer'
            }
            onClick={(e) => {
              e.preventDefault();

              if (currentPage > 1) {
                onPageChange(currentPage - 1);
              }
            }}
          />
        </PaginationItem>

        <PaginationItem>
          <span className="text-sm text-muted-foreground">
            {t('pageOf', { current: currentPage, total: totalPages })}
          </span>
        </PaginationItem>

        <PaginationItem>
          <PaginationNext
            text={t('next')}
            href="#"
            aria-disabled={currentPage === totalPages}
            className={
              currentPage === totalPages
                ? 'pointer-events-none opacity-50'
                : 'cursor-pointer'
            }
            onClick={(e) => {
              e.preventDefault();

              if (currentPage < totalPages) {
                onPageChange(currentPage + 1);
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
