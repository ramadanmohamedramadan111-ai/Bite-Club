import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import {
  Star,
  Download,
  Filter,
  MoreVertical,
} from 'lucide-react'
import { Table } from '../../components/common/Table'
import type { Column } from '../../components/common/Table'
import { Pagination } from '../../components/common/Pagination'

const reviewsData = [
  {
    id: 1,
    customer: 'Jane Doe',
    badge: 'Verified Buyer',
    rating: 5,
    content: 'The Truffle Burger was absolutely incredible! Highly recommended.',
    status: 'REPLIED',
    date: 'Oct 24, 2023',
    initials: 'JD',
    avatarColor: 'bg-orange-100 text-orange-700',
  },
  {
    id: 2,
    customer: 'Marcus Chen',
    badge: 'Local Guide',
    rating: 1,
    content: 'Waited over 40 minutes for my salad. The staff seemed confused.',
    status: 'ACTION_NEEDED',
    date: 'Oct 23, 2023',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
  },
  {
    id: 3,
    customer: 'Sarah Lewis',
    badge: 'New Customer',
    rating: 4,
    content: 'Great vegan options! I really appreciate the dedicated menu sections.',
    status: 'PENDING',
    date: 'Oct 22, 2023',
    initials: 'SL',
    avatarColor: 'bg-blue-100 text-blue-700',
  },
]

export function ReviewsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'negative'>('all')
  const [currentPage, setCurrentPage] = useState(1)

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

  const columns: Column<typeof reviewsData[0]>[] = [
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
      header: t('statusCol', 'STATUS'),
      key: 'status',
      render: (r) => (
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
            r.status === 'REPLIED'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-500'
              : r.status === 'ACTION_NEEDED'
              ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-500'
              : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-500'
          }`}
        >
          {r.status === 'REPLIED'
            ? t('statusReplied', 'Replied')
            : r.status === 'ACTION_NEEDED'
            ? t('statusActionNeeded', 'Action Needed')
            : t('statusPending', 'Pending')}
        </span>
      ),
    },
    {
      header: t('dateCol', 'DATE'),
      key: 'date',
      render: (r) => r.date,
    },
    {
      header: t('actionsCol', 'ACTIONS'),
      key: 'actions',
      render: () => (
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 transition">
          <MoreVertical size={15} />
        </button>
      ),
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
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-705 dark:bg-slate-800 dark:text-slate-200">
            <Filter size={15} /> {t('filters', 'Filters')}
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition shadow-sm">
            <Download size={15} /> {t('exportReport', 'Export Report')}
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Average Rating */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold text-gray-400 dark:text-slate-500 tracking-wider uppercase">
            {t('avgRating', 'AVERAGE RATING')}
          </p>
          <p className="text-5xl font-extrabold text-gray-900 dark:text-white mt-3 leading-none">
            4.8
          </p>
          <div className="flex justify-center mt-2">
            {renderStars(5)}
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">
            {t('basedOnReviews', 'Based on 1,248 reviews')}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-2">
          <p className="text-xs font-bold text-gray-400 dark:text-slate-500 tracking-wider uppercase mb-1">
            {t('ratingDistribution', 'Rating Distribution')}
          </p>
          {[
            { stars: 5, pct: 78 },
            { stars: 4, pct: 15 },
            { stars: 3, pct: 4 },
            { stars: 2, pct: 2 },
            { stars: 1, pct: 1 },
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

        {/* Response Metrics */}
        <div className="flex flex-col gap-4">
          {/* Response Rate */}
          <div className="flex-1 rounded-xl bg-blue-600 p-5 text-white shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-bold tracking-wider uppercase opacity-80">
              {t('responseRate', 'RESPONSE RATE')}
            </p>
            <div>
              <p className="text-2xl font-extrabold">94.2%</p>
              <p className="text-xs text-blue-100 mt-1">+2.4% {t('fromLastMonth', 'from last month')}</p>
            </div>
          </div>
          {/* Avg Response Time */}
          <div className="flex-1 rounded-xl bg-cyan-600 p-5 text-white shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-bold tracking-wider uppercase opacity-80">
              {t('avgResponseTime', 'AVG RESPONSE TIME')}
            </p>
            <div>
              <p className="text-2xl font-extrabold">2.4 {t('hrs', 'hrs')}</p>
              <p className="text-xs text-cyan-100 mt-1">-12m {t('fromLastMonth', 'from last month')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Reviews Table Block */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Table Filters & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-4 border-b border-gray-50 dark:border-slate-800">
          <div className="flex gap-2 border-b border-gray-100 dark:border-slate-800 pb-0.5 sm:pb-0 sm:border-b-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-2.5 sm:pb-0 px-3 text-sm font-semibold border-b-2 sm:border-b-0 transition ${
                activeTab === 'all'
                  ? 'border-brand-orange text-brand-orange sm:bg-orange-50/50 sm:text-brand-orange sm:rounded-lg sm:py-1.5'
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {t('allReviews', 'All Reviews')}
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`pb-2.5 sm:pb-0 px-3 text-sm font-semibold border-b-2 sm:border-b-0 transition ${
                activeTab === 'pending'
                  ? 'border-brand-orange text-brand-orange sm:bg-orange-50/50 sm:text-brand-orange sm:rounded-lg sm:py-1.5'
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {t('pendingResponse', 'Pending Response')}
            </button>
            <button
              onClick={() => setActiveTab('negative')}
              className={`pb-2.5 sm:pb-0 px-3 text-sm font-semibold border-b-2 sm:border-b-0 transition ${
                activeTab === 'negative'
                  ? 'border-brand-orange text-brand-orange sm:bg-orange-50/50 sm:text-brand-orange sm:rounded-lg sm:py-1.5'
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {t('negativeReviews', 'Negative (1-2★)')}
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-gray-400 font-medium">{t('sortBy', 'Sort by')}:</span>
            <select className="rounded-lg border border-gray-250 bg-white px-2 py-1 text-xs text-gray-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <option>{t('newestFirst', 'Newest First')}</option>
              <option>{t('highestRating', 'Highest Rating')}</option>
              <option>{t('lowestRating', 'Lowest Rating')}</option>
            </select>
          </div>
        </div>

        {/* Reusable Table */}
        <Table
          columns={columns}
          data={reviewsData}
          keyExtractor={(row) => row.id}
        />

        {/* Reusable Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={125}
          onPageChange={setCurrentPage}
          showingText={t('showingReviews', 'Showing 1-10 of 1,248 reviews')}
        />
      </div>
    </div>
  )
}
