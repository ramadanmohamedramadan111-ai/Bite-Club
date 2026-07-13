import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import {
  Store,
  Briefcase,
  Clock,
  Bell,
  Link2,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
} from 'lucide-react'
import Logo from '../../assets/images/logo.svg'

export function SettingsPage() {
  const { t } = useTranslation()

  // State for working hours toggles
  const [workingDays, setWorkingDays] = useState({
    monday: true,
    tuesday: true,
    sunday: false,
  })

  // State for notification checkboxes
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: true,
    sms: false,
  })

  return (
    <div className="flex flex-col gap-6 mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('restaurantSettings', 'Restaurant Settings')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            {t('settingsSubtitle', 'Configure your business identity, operations, and compliance.')}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {t('discard', 'Discard')}
          </button>
          <button className="px-5 py-2.5 rounded-xl bg-brand-orange text-sm font-semibold text-white hover:opacity-90 transition shadow-sm">
            {t('saveChanges', 'Save Changes')}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Business Profile */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-50 dark:border-slate-800">
            <Store className="text-brand-orange h-5 w-5" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {t('businessProfile', 'Business Profile')}
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Logo block */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="relative h-28 w-28 rounded-2xl bg-orange-50 dark:bg-slate-800 border-2 border-dashed border-brand-orange/30 flex flex-col items-center justify-center p-4">
                <img src={Logo} alt="logo" className="h-12 w-12" />
              </div>
              <button className="text-xs font-bold text-brand-orange hover:underline uppercase tracking-wider flex items-center gap-1.5">
                <Upload size={12} /> {t('changeLogo', 'Change Logo')}
              </button>
            </div>

            {/* Inputs */}
            <div className="flex-1 grid gap-4 w-full">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                    {t('restaurantNameInput', 'Restaurant Name')}
                  </label>
                  <input
                    type="text"
                    defaultValue="BiteClub Main Street"
                    className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                    {t('businessEmailInput', 'Business Email')}
                  </label>
                  <input
                    type="email"
                    defaultValue="contact@biteclub.io"
                    className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  {t('shortDescriptionInput', 'Short Description')}
                </label>
                <textarea
                  rows={3}
                  defaultValue="Gourmet burgers and artisanal sides served in a fast-casual atmosphere. Open for dine-in and delivery."
                  className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financials */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-50 dark:border-slate-800">
            <Briefcase className="text-brand-orange h-5 w-5" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {t('financials', 'Financials')}
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                {t('taxIdInput', 'Tax ID / VAT')}
              </label>
              <input
                type="text"
                defaultValue="TX-9823-BC"
                className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="rounded-xl bg-orange-50/50 p-4 border border-orange-100/40 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-white">
                  {t('defaultTaxRate', 'Default Tax Rate')}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t('appliedToAllOrders', 'Applied to all orders')}
                </p>
              </div>
              <span className="text-xl font-extrabold text-brand-orange">8.5%</span>
            </div>

            <button className="text-sm font-bold text-brand-orange hover:underline text-left flex items-center gap-1.5 mt-2">
              <Plus size={16} /> {t('addCustomTaxRule', 'Add custom tax rule')}
            </button>
          </div>
        </div>

        {/* Working Hours */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-50 dark:border-slate-800">
            <Clock className="text-brand-orange h-5 w-5" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {t('workingHours', 'Working Hours')}
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {/* Monday */}
            <div className="flex items-center justify-between gap-4 py-1 border-b border-gray-50 dark:border-slate-800/40 last:border-0 pb-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-slate-200 min-w-[70px]">
                {t('monday', 'Monday')}
              </span>
              {workingDays.monday ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue="09:00"
                    className="w-16 text-center rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="text"
                    defaultValue="22:00"
                    className="w-16 text-center rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              ) : (
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  {t('closed', 'Closed')}
                </span>
              )}
              <button
                onClick={() =>
                  setWorkingDays((prev) => ({ ...prev, monday: !prev.monday }))
                }
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  workingDays.monday ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                    workingDays.monday ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Tuesday */}
            <div className="flex items-center justify-between gap-4 py-1 border-b border-gray-50 dark:border-slate-800/40 last:border-0 pb-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-slate-200 min-w-[70px]">
                {t('tuesday', 'Tuesday')}
              </span>
              {workingDays.tuesday ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue="09:00"
                    className="w-16 text-center rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="text"
                    defaultValue="22:00"
                    className="w-16 text-center rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              ) : (
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  {t('closed', 'Closed')}
                </span>
              )}
              <button
                onClick={() =>
                  setWorkingDays((prev) => ({ ...prev, tuesday: !prev.tuesday }))
                }
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  workingDays.tuesday ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                    workingDays.tuesday ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Sunday */}
            <div className="flex items-center justify-between gap-4 py-1 border-b border-gray-50 dark:border-slate-800/40 last:border-0 pb-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-slate-200 min-w-[70px]">
                {t('sunday', 'Sunday')}
              </span>
              {workingDays.sunday ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue="09:00"
                    className="w-16 text-center rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="text"
                    defaultValue="22:00"
                    className="w-16 text-center rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              ) : (
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  {t('closed', 'Closed')}
                </span>
              )}
              <button
                onClick={() =>
                  setWorkingDays((prev) => ({ ...prev, sunday: !prev.sunday }))
                }
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  workingDays.sunday ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                    workingDays.sunday ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-50 dark:border-slate-800">
            <Bell className="text-brand-orange h-5 w-5" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {t('notifications', 'Notifications')}
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {/* Email Summaries */}
            <label className="flex items-start gap-3 rounded-xl border border-gray-100 p-4 dark:border-slate-800 dark:bg-slate-950 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={() =>
                  setNotifications((prev) => ({ ...prev, email: !prev.email }))
                }
                className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
              />
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-white">
                  {t('emailSummaries', 'Email Summaries')}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t('emailSummariesDesc', 'Daily performance reports and order history.')}
                </p>
              </div>
            </label>

            {/* Desktop Alerts */}
            <label className="flex items-start gap-3 rounded-xl border border-gray-100 p-4 dark:border-slate-800 dark:bg-slate-950 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifications.desktop}
                onChange={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    desktop: !prev.desktop,
                  }))
                }
                className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
              />
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-white">
                  {t('desktopAlerts', 'Desktop Alerts')}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t('desktopAlertsDesc', 'Real-time terminal notifications for new orders.')}
                </p>
              </div>
            </label>

            {/* SMS Critical Alerts */}
            <label className="flex items-start gap-3 rounded-xl border border-gray-100 p-4 dark:border-slate-800 dark:bg-slate-950 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifications.sms}
                onChange={() =>
                  setNotifications((prev) => ({ ...prev, sms: !prev.sms }))
                }
                className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
              />
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-white">
                  {t('smsCriticalAlerts', 'SMS Critical Alerts')}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t('smsCriticalDesc', 'Alerts for system downtime or high-priority delays.')}
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
