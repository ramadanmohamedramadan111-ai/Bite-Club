import { useCallback, useMemo, useState } from 'react'
import type { ExportDashboardPdfOptions } from '../types/export'

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatCurrency(value: number) {
  return `${value.toLocaleString()} EGP`
}

export function useExportDashboardPdf() {
  const [isExporting, setIsExporting] = useState(false)

  const exportPdf = useCallback(async ({ analytics, period, title, report, reviews, customers, order }: ExportDashboardPdfOptions) => {
    setIsExporting(true)

    try {
      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: Arial, sans-serif; color: #111827; padding: 24px; }
              h1 { margin-bottom: 8px; }
              .meta { color: #6b7280; margin-bottom: 20px; }
              .card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; margin-bottom: 12px; }
              .row { display: flex; justify-content: space-between; margin: 6px 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
              th { background: #f9fafb; }
              ul { padding-left: 18px; }
            </style>
          </head>
          <body>
            <h1>${escapeHtml(title)}</h1>
            <div class="meta">Period: ${escapeHtml(period)}</div>
            ${order ? `
              <div class="card">
                <h2>Order ${escapeHtml(order.id)}</h2>
                <div class="row"><strong>Status:</strong> <span style="text-transform:capitalize">${escapeHtml(order.status)}</span></div>
                <div class="row"><strong>Customer:</strong> <span>${escapeHtml(order.customer.name)}</span></div>
                <div class="row"><strong>Phone:</strong> <span>${escapeHtml(order.customer.phone)}</span></div>
              </div>

              ${order.payments.length > 0 ? `
                <div class="card">
                  <h3>Payments</h3>
                  <table>
                    <thead><tr><th>Method</th><th>Amount</th><th>Status</th></tr></thead>
                    <tbody>
                      ${order.payments.map((p) => `
                        <tr>
                          <td style="text-transform:capitalize">${escapeHtml(p.method)}</td>
                          <td>${escapeHtml(p.amount)} EGP</td>
                          <td style="text-transform:capitalize">${escapeHtml(p.status)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              ` : ''}

              <div class="card">
                <h3>Order Items</h3>
                <table>
                  <thead>
                    <tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
                  </thead>
                  <tbody>
                    ${order.items.map((item) => `
                      <tr>
                        <td>${escapeHtml(item.name)}</td>
                        <td>${escapeHtml(item.qty)}</td>
                        <td>${escapeHtml(item.unitPrice)} EGP</td>
                        <td>${escapeHtml(item.totalPrice)} EGP</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                <div style="margin-top:12px; border-top:1px solid #e5e7eb; padding-top:10px;">
                  <div class="row"><span>Subtotal:</span> <strong>${order.subtotal.toFixed(2)} EGP</strong></div>
                  <div class="row"><span>Service Tax:</span> <strong>${order.tax.toFixed(2)} EGP</strong></div>
                  <div class="row"><span>Delivery Fee:</span> <strong>${order.deliveryFee.toFixed(2)} EGP</strong></div>
                  <div class="row" style="font-size:1.1em; margin-top:8px; padding-top:8px; border-top:1px solid #e5e7eb;">
                    <span><strong>TOTAL:</strong></span>
                    <strong style="color:#ff6f20; font-size:1.2em;">${order.total.toFixed(2)} EGP</strong>
                  </div>
                </div>
              </div>

              <div class="card">
                <h3>Order Lifecycle</h3>
                <ul>
                  ${order.lifecycle.map((step) => `
                    <li style="margin-bottom:6px;">
                      <span style="color: ${step.done ? '#16a34a' : step.current ? '#ff6f20' : '#9ca3af'}; font-weight:bold;">
                        ${step.done ? '✓' : step.current ? '●' : '○'}
                      </span>
                      &nbsp;${escapeHtml(step.label)}
                      ${step.current ? ' <em style="color:#ff6f20;">(Current)</em>' : ''}
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
            ${report ? `
              <div class="card">
                <div class="row"><strong>Overall Score:</strong> <span>${report.overall_score}/100</span></div>
                <div class="row"><strong>Summary:</strong> <span>${escapeHtml(report.summary)}</span></div>
                <div class="row"><strong>Revenue:</strong> <span>${escapeHtml(formatCurrency(report.sales_performance.revenue))}</span></div>
                <div class="row"><strong>Orders:</strong> <span>${escapeHtml(report.sales_performance.orders)}</span></div>
              </div>
              <div class="card">
                <h3>Customer Satisfaction</h3>
                <div class="row"><strong>Average Rating:</strong> <span>${escapeHtml(report.customer_satisfaction.average_rating.toFixed(1))}/5</span></div>
                <p><strong>Positive Feedback:</strong></p>
                <ul>${report.customer_satisfaction.positive_feedback.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
              </div>
              <div class="card">
                <h3>Recommendations</h3>
                <ul>${report.recommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
              </div>
            ` : ''}
            ${reviews && reviews.length > 0 ? `
              <div class="card">
                <h3>Reviews</h3>
                <table>
                  <thead>
                    <tr><th>Customer</th><th>Rating</th><th>Content</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    ${reviews.map((item) => `
                      <tr>
                        <td>${escapeHtml(item.customer)}</td>
                        <td>${escapeHtml(item.rating)}</td>
                        <td>${escapeHtml(item.content)}</td>
                        <td>${escapeHtml(item.status)}</td>
                        <td>${escapeHtml(item.date)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : ''}
            ${customers && customers.length > 0 ? `
              <div class="card">
                <h3>Customers</h3>
                <table>
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Spend</th><th>Last Order</th><th>Segment</th></tr>
                  </thead>
                  <tbody>
                    ${customers.map((item) => `
                      <tr>
                        <td>${escapeHtml(item.name)}</td>
                        <td>${escapeHtml(item.email)}</td>
                        <td>${escapeHtml(item.phone)}</td>
                        <td>${escapeHtml(item.orders)}</td>
                        <td>${escapeHtml(formatCurrency(item.spend))}</td>
                        <td>${escapeHtml(item.lastOrder)}</td>
                        <td>${escapeHtml(item.segment)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : ''}
            ${analytics ? `
              <div class="card">
                <div class="row"><strong>Revenue:</strong> <span>${escapeHtml(formatCurrency(analytics.summary.revenue))}</span></div>
                <div class="row"><strong>Orders:</strong> <span>${escapeHtml(analytics.summary.orders)}</span></div>
                <div class="row"><strong>Pending Orders:</strong> <span>${escapeHtml(analytics.pending_orders)}</span></div>
                <div class="row"><strong>Average Rating:</strong> <span>${escapeHtml(analytics.average_rating.toFixed(1))} / 5</span></div>
              </div>
              <div class="card">
                <h3>Latest Orders</h3>
                <table>
                  <thead>
                    <tr><th>#</th><th>Customer</th><th>Status</th><th>Total</th></tr>
                  </thead>
                  <tbody>
                    ${analytics.latest_orders.map((item) => `
                      <tr>
                        <td>${escapeHtml(item.id)}</td>
                        <td>${escapeHtml(item.customer.name)}</td>
                        <td>${escapeHtml(item.status)}</td>
                        <td>${escapeHtml(formatCurrency(item.financials.total))}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              ${analytics.recent_reviews.length > 0 ? `
                <div class="card">
                  <h3>Recent Reviews</h3>
                  <table>
                    <thead>
                      <tr><th>Customer</th><th>Rating</th><th>Comment</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      ${analytics.recent_reviews.map((r) => `
                        <tr>
                          <td>${escapeHtml(r.user.name)}</td>
                          <td>${escapeHtml(r.rating)} / 5</td>
                          <td>${escapeHtml(r.comment)}</td>
                          <td>${escapeHtml(r.created_at)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              ` : ''}
            ` : ''}
            ${!report && (!reviews || reviews.length === 0) && (!customers || customers.length === 0) && !analytics && !order ? `<div class="card"><p>No data was available for this export.</p></div>` : ''}
          </body>
        </html>
      `

      const printWindow = window.open('', '_blank', 'width=900,height=700')
      if (!printWindow) return

      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    } finally {
      setIsExporting(false)
    }
  }, [])

  return useMemo(() => ({ exportPdf, isExporting }), [exportPdf, isExporting])
}
