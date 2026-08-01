import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Sparkles,
  TrendingUp,
  UtensilsCrossed,
  Star,
  AlertTriangle,
  CheckCircle2,
  ListChecks,
  RefreshCw,
  ShoppingBag,
  DollarSign,
  Clock,
  BarChart2,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Download,
} from 'lucide-react'
import { useAiStore } from '../../store/aiStore'

// ── Severity config ───────────────────────────────────────────────────────────
const SEVERITY: Record<string, { label: string; cls: string; dot: string }> = {
  high:   { label: 'High',   cls: 'bg-red-50    dark:bg-red-950/30  border-red-200    dark:border-red-800/40  text-red-700    dark:text-red-400',   dot: 'bg-red-500'    },
  medium: { label: 'Medium', cls: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800/40 text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
  low:    { label: 'Low',    cls: 'bg-blue-50   dark:bg-blue-950/30  border-blue-200   dark:border-blue-800/40  text-blue-700   dark:text-blue-400',   dot: 'bg-blue-400'   },
}

export function ReportsPage() {
  const { t, i18n } = useTranslation()
  const { reports, isLoading, error, fetchReports } = useAiStore()
  const [selectedTab, setSelectedTab] = useState(0)

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const getLocalDateString = (offsetDays: number) => {
    const d = new Date()
    d.setDate(d.getDate() - offsetDays)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const date = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${date}`
  }

  const tabs = [
    { key: 0, label: t('today'), dateStr: getLocalDateString(0) },
    { key: 1, label: t('yesterday'), dateStr: getLocalDateString(1) },
    { key: 2, label: t('twoDaysAgo'), dateStr: getLocalDateString(2) },
  ]

  const activeReportRecord = reports.find((r) => r.report_date === tabs[selectedTab].dateStr) || null
  const report = activeReportRecord
    ? (i18n.language === 'ar' ? activeReportRecord.report_ar : activeReportRecord.report_en)
    : null

  const formatGenerationTime = (createdAtStr?: string) => {
    if (!createdAtStr) return ''
    const date = new Date(createdAtStr)
    return date.toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  // ── Score colour band ─────────────────────────────────────────────────────
  const scoreColor = (s: number) =>
    s >= 80 ? 'text-emerald-500' : s >= 60 ? 'text-yellow-500' : 'text-red-500'
  const scoreBg = (s: number) =>
    s >= 80 ? 'from-emerald-500 to-teal-400' : s >= 60 ? 'from-yellow-400 to-amber-400' : 'from-red-500 to-orange-400'
  const scoreLabel = (s: number) =>
    s >= 80 ? t('excellent') : s >= 60 ? t('good') : t('needsWork')
  const sevLabel = (sev: string) =>
    sev === 'high' ? t('highSeverity') : sev === 'medium' ? t('mediumSeverity') : t('lowSeverity')

  return (
    <div className="flex flex-col gap-8 mx-auto w-full">

      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8 shadow-sm border border-orange-100 dark:border-slate-700/40">
        {/* Background glow */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brand-orange/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-brand-orange/5 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange/20">
                <Sparkles className="text-brand-orange" size={18} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">{t('aiPowered')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
              {t('aiReports')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md">
              {t('aiReportsSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Report History Tabs & Info ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 p-1 bg-gray-50 dark:bg-slate-800/60 rounded-xl self-start">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                selectedTab === tab.key
                  ? 'bg-white dark:bg-slate-700 text-brand-orange shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Generation Info Metadata ───────────────────────────────────── */}
        {activeReportRecord && (
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-gray-400" />
              <span>
                {t('reportGeneratedAt')}: {formatGenerationTime(activeReportRecord.created_at)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-gray-400" />
              <span>
                {t('reportLanguage')}: {i18n.language === 'ar' ? 'العربية' : 'English'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 px-5 py-4">
          <AlertTriangle size={18} className="text-red-500 shrink-0" />
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* ── Loading skeleton ─────────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-6 py-24">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-brand-orange/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-brand-orange animate-spin" />
            <Sparkles size={32} className="text-brand-orange animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-base font-bold text-gray-800 dark:text-white">{t('analyzingRestaurant')}</p>
            <p className="text-sm text-gray-400 dark:text-slate-500">{t('analyzingDesc')}</p>
          </div>
          {/* Skeleton cards */}
          <div className="w-full max-w-3xl grid gap-4 sm:grid-cols-2 mt-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {!report && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center gap-5 py-28 text-center bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-8 w-full">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
            <BarChart2 size={36} className="text-brand-orange/50" />
          </div>
          <div className="flex flex-col gap-2 max-w-md">
            <p className="text-base font-bold text-gray-700 dark:text-slate-200">{t('noReportYet')}</p>
            <p className="text-sm text-gray-400 dark:text-slate-500">
              {selectedTab === 0 
                ? t('noReportForToday') 
                : (i18n.language === 'ar' ? 'التقرير الخاص بهذا اليوم غير متوفر.' : 'Report for this day is not available.')
              }
            </p>
          </div>
        </div>
      )}

      {/* ── Report Content ───────────────────────────────────────────────── */}
      {report && !isLoading && (
        <div className="flex flex-col gap-6">

          {/* Score + Summary row */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Score card */}
            <div className="relative overflow-hidden sm:col-span-1 flex flex-col items-center justify-center rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm gap-3">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-orange/5 to-transparent" />
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">{t('healthScore')}</p>
              <div className="relative flex h-28 w-28 items-center justify-center">
                {/* SVG ring */}
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" strokeWidth="10" className="stroke-gray-100 dark:stroke-slate-800" />
                  <circle
                    cx="50" cy="50" r="44" fill="none" strokeWidth="10"
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ${report.overall_score >= 80 ? 'stroke-emerald-500' : report.overall_score >= 60 ? 'stroke-yellow-400' : 'stroke-red-500'}`}
                    strokeDasharray={`${2 * Math.PI * 44 * report.overall_score / 100} ${2 * Math.PI * 44}`}
                  />
                </svg>
                <span className={`text-4xl font-black ${scoreColor(report.overall_score)}`}>{report.overall_score}</span>
              </div>
              <div className={`text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r ${scoreBg(report.overall_score)} text-white`}>
                {scoreLabel(report.overall_score)}
              </div>
            </div>

            {/* Summary card */}
            <div className="sm:col-span-2 flex flex-col gap-3 rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-brand-orange" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">{t('executiveSummary')}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed flex-1">{report.summary}</p>
            </div>
          </div>

          {/* Sales + Customer satisfaction */}
          <div className="grid gap-4 sm:grid-cols-2">

            {/* Sales */}
            <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/20">
                  <TrendingUp size={15} className="text-blue-500" />
                </div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">{t('salesPerformance')}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: DollarSign, label: t('aiRevenue'),    value: `${report.sales_performance.revenue} EGP`, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
                  { icon: ShoppingBag, label: t('aiOrders'),    value: String(report.sales_performance.orders),  color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
                  { icon: TrendingUp, label: t('aiGrowth'),     value: report.sales_performance.growth,          color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
                  { icon: Clock, label: t('aiPeakHours'),       value: report.sales_performance.peak_hours,      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-start gap-3 rounded-xl bg-gray-50 dark:bg-slate-800/40 p-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}>
                      <Icon size={13} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">{label}</p>
                      <p className="text-sm font-extrabold text-gray-800 dark:text-white mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Satisfaction */}
            <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-50 dark:bg-yellow-950/20">
                  <Star size={15} className="text-yellow-500" />
                </div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">{t('customerSatisfaction')}</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-5xl font-black text-gray-900 dark:text-white">{report.customer_satisfaction.average_rating}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className={i < Math.round(report.customer_satisfaction.average_rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-slate-700'} />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{t('outOf5')}</span>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  {report.customer_satisfaction.positive_feedback.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        <ThumbsUp size={10} /> {t('positiveLabel')}
                      </p>
                      {report.customer_satisfaction.positive_feedback.map((f, i) => (
                        <p key={i} className="text-xs text-gray-600 dark:text-slate-400 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl px-3 py-2 italic leading-relaxed">"{f}"</p>
                      ))}
                    </div>
                  )}
                  {report.customer_satisfaction.negative_feedback.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400">
                        <ThumbsDown size={10} /> {t('negativeLabel')}
                      </p>
                      {report.customer_satisfaction.negative_feedback.map((f, i) => (
                        <p key={i} className="text-xs text-gray-600 dark:text-slate-400 bg-red-50 dark:bg-red-950/20 rounded-xl px-3 py-2 italic leading-relaxed">"{f}"</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Performance */}
          <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/20">
                <UtensilsCrossed size={15} className="text-brand-orange" />
              </div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">{t('menuPerformance')}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { emoji: '🏆', label: t('bestSellers'),  items: report.menu_performance.best_selling_items,  pill: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/30' },
                { emoji: '🐢', label: t('slowMoving'),   items: report.menu_performance.slow_selling_items,   pill: 'bg-yellow-100  dark:bg-yellow-950/40  text-yellow-700  dark:text-yellow-400',  border: 'border-yellow-100  dark:border-yellow-900/30'  },
                { emoji: '📉', label: t('worstSellers'), items: report.menu_performance.worst_selling_items, pill: 'bg-red-100    dark:bg-red-950/40    text-red-600    dark:text-red-400',    border: 'border-red-100    dark:border-red-900/30'    },
              ].map(({ emoji, label, items, pill, border }) => (
                <div key={label} className={`rounded-xl border ${border} bg-gray-50 dark:bg-slate-800/30 p-4 flex flex-col gap-2`}>
                  <p className="text-xs font-bold text-gray-500 dark:text-slate-400">{emoji} {label}</p>
                  {items.length === 0
                    ? <span className="text-xs text-gray-300 dark:text-slate-600">{t('noneLabel')}</span>
                    : items.map((item) => (
                      <span key={item} className={`inline-block rounded-lg px-3 py-1.5 text-xs font-semibold ${pill}`}>{item}</span>
                    ))
                  }
                </div>
              ))}
            </div>
            {report.menu_performance.suggested_promotions.length > 0 && (
              <div className="border-t border-gray-50 dark:border-slate-800 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-orange mb-3">💡 Suggested Promotions</p>
                <div className="flex flex-wrap gap-2">
                  {report.menu_performance.suggested_promotions.map((p, i) => (
                    <span key={i} className="rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 px-4 py-2 text-xs font-semibold text-brand-orange">{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Operational Issues */}
          {report.operational_issues.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/20">
                  <AlertTriangle size={15} className="text-red-500" />
                </div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">{t('operationalIssues')}</h2>
              </div>
              <div className="flex flex-col gap-3">
                {report.operational_issues.map((issue, i) => {
                  const sev = SEVERITY[issue.severity] ?? SEVERITY.low
                  return (
                    <div key={i} className={`rounded-2xl border p-4 flex flex-col gap-2 ${sev.cls}`}>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${sev.dot}`} />
                        <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">{sevLabel(issue.severity)} {t('severityLabel')}</span>
                      </div>
                      <p className="text-sm font-semibold">{issue.explanation}</p>
                      <p className="text-xs opacity-80">💡 {issue.suggested_solution}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recommendations + Action Plan */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/20">
                  <CheckCircle2 size={15} className="text-purple-500" />
                </div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">{t('recommendations')}</h2>
              </div>
              <ul className="flex flex-col gap-3">
                {report.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600 dark:text-slate-400">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950/40 text-[10px] font-extrabold text-purple-600 dark:text-purple-400">{i + 1}</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/20">
                  <ListChecks size={15} className="text-teal-500" />
                </div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">{t('actionPlan')}</h2>
              </div>
              <ul className="flex flex-col gap-3">
                {report.action_plan.map((a, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600 dark:text-slate-400">
                    <CheckCircle2 size={15} className="text-teal-500 shrink-0 mt-0.5" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

