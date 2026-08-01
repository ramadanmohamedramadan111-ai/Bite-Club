import { useEffect, useMemo, useState } from 'react'
import { restaurantService } from '../lib/restaurantService'
import type { DashboardAnalytics, DashboardPeriod } from '../types/analytics'

export function useDashboardAnalytics(period: DashboardPeriod) {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    restaurantService.getDashboardAnalytics(period)
      .then((data) => {
        if (mounted) setAnalytics(data)
      })
      .catch(() => {
        if (mounted) setAnalytics(null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [period])

  return useMemo(() => ({ analytics, loading }), [analytics, loading])
}
