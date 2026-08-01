export type AiResponse = {
  success: boolean
  message: string
  data: AiReport
}

export type AiReport = {
  summary: string
  overall_score: number
  sales_performance: {
    revenue: number
    orders: number
    growth: string
    peak_hours: string
  }
  menu_performance: {
    best_selling_items: string[]
    worst_selling_items: string[]
    slow_selling_items: string[]
    suggested_promotions: string[]
  }
  customer_satisfaction: {
    average_rating: number
    positive_feedback: string[]
    negative_feedback: string[]
    common_complaints: string[]
  }
  operational_issues: {
    severity: 'low' | 'medium' | 'high'
    explanation: string
    suggested_solution: string
  }[]
  recommendations: string[]
  action_plan: string[]
}
