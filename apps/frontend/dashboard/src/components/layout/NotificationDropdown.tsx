import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useNotificationStore } from '../../store/notificationStore'
import type { ApiNotification } from '../../types/notifications'

function timeAgo(dateString: string, locale: 'en' | 'ar') {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(dateString).getTime()) / 1000))
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]

  for (const [unit, secondsInUnit] of units) {
    const value = Math.floor(seconds / secondsInUnit)
    if (value >= 1) return rtf.format(-value, unit)
  }
  return rtf.format(0, 'second')
}

function actionPath(actionUrl: string): string | null {
  try {
    return new URL(actionUrl).pathname
  } catch {
    return null
  }
}

export function NotificationDropdown() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const isLoading = useNotificationStore((s) => s.isLoading)
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications)
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead)

  useEffect(() => {
    void fetchUnreadCount()
    const interval = setInterval(() => void fetchUnreadCount(), 60000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  useEffect(() => {
    if (open) void fetchNotifications()
  }, [open, fetchNotifications])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const handleNotificationClick = (notification: ApiNotification) => {
    if (!notification.read_at) void markAsRead(notification.id)
    const path = actionPath(notification.data.action_url)
    if (path) {
      setOpen(false)
      navigate(path)
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={t('notifications')}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-brand-orange hover:text-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-orange px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-4 top-16 z-50 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:absolute sm:inset-x-auto sm:top-auto sm:end-0 sm:mt-2 sm:w-80">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-slate-700">
            <p className="text-sm font-bold text-gray-800 dark:text-white">{t('notifications')}</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                className="text-xs font-semibold text-brand-orange hover:underline"
              >
                {t('markAllAsRead')}
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto sm:max-h-96">
            {isLoading && notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-gray-400 dark:text-slate-500">{t('loading')}</p>
            )}

            {!isLoading && notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-gray-400 dark:text-slate-500">
                {t('noNotifications')}
              </p>
            )}

            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleNotificationClick(notification)}
                className={`flex w-full flex-col gap-0.5 border-b border-gray-50 px-4 py-3 text-start transition hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800 ${
                  !notification.read_at ? 'bg-orange-50/50 dark:bg-slate-800/60' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  {!notification.read_at && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />}
                  <p className="text-xs font-bold text-gray-800 dark:text-white">{notification.data.title}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400">{notification.data.body}</p>
                <p className="mt-0.5 text-[10px] text-gray-400 dark:text-slate-500">
                  {timeAgo(notification.created_at, i18n.language === 'ar' ? 'ar' : 'en')}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
