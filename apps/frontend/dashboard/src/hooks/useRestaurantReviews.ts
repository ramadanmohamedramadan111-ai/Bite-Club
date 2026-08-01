import { useEffect, useMemo, useState } from 'react'
import { restaurantService } from '../lib/restaurantService'
import type { ReviewListParams, ReviewsResponseData } from '../types/reviews'

export function useRestaurantReviews(params: ReviewListParams = {}) {
  const [data, setData] = useState<ReviewsResponseData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    restaurantService.getReviews(params)
      .then((response) => {
        if (mounted) setData(response)
      })
      .catch(() => {
        if (mounted) setData(null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [params.page, params.per_page, params.search])

  return useMemo(() => ({ data, loading }), [data, loading])
}
