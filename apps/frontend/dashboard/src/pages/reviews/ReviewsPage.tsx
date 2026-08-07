import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebounce } from 'use-debounce'
import {
  Star,
  Download,
  Search,
} from 'lucide-react'
import { Table } from '../../components/common/Table'
import type { Column } from '../../components/common/Table'
import { Pagination } from '../../components/common/Pagination'
import { useExportDashboardPdf } from '../../hooks/useExportDashboardPdf'
import { useRestaurantReviews } from '../../hooks/useRestaurantReviews'
import type { ApiReview } from '../../types/reviews'

export function ReviewsPage() {
  const { t } = useTranslation()
  const { exportPdf, isExporting } = useExportDashboardPdf()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [debouncedSearch] = useDebounce(query, 400)

  const handleSearch = (val: string) => {
    if (val) {
      searchParams.set('q', val)
    } else {
      searchParams.delete('q')
    }
    setSearchParams(searchParams)
    setCurrentPage(1)
  }

  const { data, loading } = useRestaurantReviews({
    page: currentPage,
    per_page: 10,
    search: debouncedSearch || undefined,
  })

  const reviews = (data?.reviews?.data ?? []).map((review: ApiReview) => ({
    id: review.id,
    customer: review.user.name,
    badge: 'Verified Customer',
    rating: review.rating,
    content: review.comment,
    status: review.rating >= 4 ? 'REPLIED' : review.rating <= 2 ? 'ACTION_NEEDED' : 'PENDING',
    date: new Date(review.created_at).toLocaleDateString(),
    initials: review.user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
    avatar: review.user.profile_image ?? undefined,
    avatarColor: 'bg-orange-100 text-orange-700',
  }))



  const renderStars = (count: number) => {
    return (
      <div className="flex items-center gap-0.5 text-brand-orange">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            fill={i < count ? 'currentColor' : 'none'}
            className={i < count ? 'text-brand-orange' : 'text-gray-350 dark:text-slate-600'}
          />
        ))}
      </div>
    )
  }

  const columns: Column<(typeof reviews)[number]>[] = [
    {
      header: t('customerCol', 'CUSTOMER'),
      key: 'customer',
      render: (r) => (
        <div className="flex items-center gap-3">
          {r.avatar ? (
            <img
              src={r.avatar}
              alt={r.customer}
              className="h-9 w-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                r.avatarColor || 'bg-gray-150'
              }`}
            >
              {r.initials}
            </div>
          )}
          <div>
            <p className="font-bold text-gray-800 dark:text-white">
              {r.customer}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500">
              {r.badge}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: t('ratingCol', 'RATING'),
      key: 'rating',
      render: (r) => renderStars(r.rating),
    },
    {
      header: t('reviewContentCol', 'REVIEW CONTENT'),
      key: 'content',
      className: 'max-w-xs md:max-w-md lg:max-w-lg',
      render: (r) => (
        <p className="text-gray-700 dark:text-slate-350 truncate" title={r.content}>
          "{r.content}"
        </p>
      ),
    },
   
    {
      header: t('dateCol', 'DATE'),
      key: 'date',
      render: (r) => r.date,
    },
  ]

  return (
    <div className="flex flex-col gap-6 mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('reviewsFeedback', 'Reviews & Feedback')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            {t('reviewsSubtitle', 'Manage and respond to customer experiences across all branches.')}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
         
          <button
            type="button"
            onClick={() => exportPdf({ period: 'week', title: t('reviewsFeedback', 'Reviews & Feedback'), reviews: reviews.map((review) => ({
              customer: review.customer,
              rating: review.rating,
              content: review.content,
              status: review.status,
              date: review.date,
            })) })}
            disabled={isExporting || loading}
            className="flex items-center gap-2 rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white transition shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Download size={15} /> {isExporting ? t('exporting') : t('exportReport', 'Export Report')}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder={t('searchReviews', 'Search reviews by customer or content...')}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full max-w-md ps-10 pe-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
        />
      </div>

      {/* Top Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Average Rating */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold text-gray-400 dark:text-slate-500 tracking-wider uppercase">
            {t('avgRating', 'AVERAGE RATING')}
          </p>
          <p className="text-5xl font-extrabold text-gray-900 dark:text-white mt-3 leading-none">
            {loading ? '—' : (data?.summary.average_rating ?? 0).toFixed(1)}
          </p>
          <div className="flex justify-center mt-2">
            {renderStars(5)}
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">
            {loading ? t('loading', 'Loading...') : t('basedOnReviews', 'Based on {{count}} reviews').replace('{{count}}', String(data?.summary.total_reviews ?? 0))}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-2">
          <p className="text-xs font-bold text-gray-400 dark:text-slate-500 tracking-wider uppercase mb-1">
            {t('ratingDistribution', 'Rating Distribution')}
          </p>
          {[
            { stars: 5, pct: data?.summary.ratings?.['5'] ?? 0 },
            { stars: 4, pct: data?.summary.ratings?.['4'] ?? 0 },
            { stars: 3, pct: data?.summary.ratings?.['3'] ?? 0 },
            { stars: 2, pct: data?.summary.ratings?.['2'] ?? 0 },
            { stars: 1, pct: data?.summary.ratings?.['1'] ?? 0 },
          ].map((item) => (
            <div key={item.stars} className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
              <span className="w-10 font-bold shrink-0">{item.stars} {t('star', 'Star')}</span>
              <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-orange"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
              <span className="w-8 text-right font-bold text-gray-800 dark:text-white shrink-0">{item.pct}%</span>
            </div>
          ))}
        </div>

      </div>

      {/* Main Reviews Table Block */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      

        {/* Reusable Table */}
        {loading ? (
          <div className="p-6 text-sm text-gray-500 dark:text-slate-400">{t('loading', 'Loading reviews...')}</div>
        ) : (
          <Table
            columns={columns}
            data={reviews}
            keyExtractor={(row) => row.id}
          />
        )}

        {/* Reusable Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={Math.max(1, data?.reviews.meta.last_page ?? 1)}
          onPageChange={setCurrentPage}
          showingText={
            t('showingReviews', 'Showing {{from}}-{{to}} of {{total}} reviews')
              .replace('{{from}}',  String((currentPage - 1) * 10 + 1))
              .replace('{{to}}',    String(Math.min(currentPage * 10, data?.reviews.meta.total ?? 0)))
              .replace('{{total}}', String(data?.reviews.meta.total ?? 0))
          }
        />
      </div>
    </div>
  )
}
