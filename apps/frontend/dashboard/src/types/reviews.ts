export type ReviewUser = {
  id: number
  name: string
  profile_image: string | null
}

export type ApiReview = {
  id: number
  user: ReviewUser
  rating: number
  comment: string
  created_at: string
}

export type ReviewSummary = {
  average_rating: number
  total_reviews: number
  ratings: {
    '5'?: number
    '4'?: number
    '3'?: number
    '2'?: number
    '1'?: number
  }
}

export type ReviewMeta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export type ReviewsResponseData = {
  summary: ReviewSummary
  reviews: {
    data: ApiReview[]
    meta: ReviewMeta
  }
}

export type RestaurantReviewsResponse = {
  success: boolean
  message: string
  data: ReviewsResponseData
}

export type ReviewListParams = {
  page?: number
  per_page?: number
  search?: string
}

export type DashboardReview = ApiReview

