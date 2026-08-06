import { useEffect, useMemo, useState } from 'react'
import { restaurantService } from '../lib/restaurantService'
import type { DashboardAnalytics, DashboardPeriod } from '../types/analytics'

export function useDashboardAnalytics(period: DashboardPeriod) {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    restaurantService.getDashboardAnalytics(period)
      .then((data) => {
        if (mounted) setAnalytics(data)
      })
      .catch((e) => {
        if (mounted) {
          setAnalytics(null)
          setError(e instanceof Error ? e.message : 'Failed to load dashboard analytics')
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [period])

  return useMemo(() => ({ analytics, loading, error }), [analytics, loading, error])
}
