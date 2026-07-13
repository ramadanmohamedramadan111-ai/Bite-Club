import { useLocale } from '../contexts/LocaleContext'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import { PageHeader } from '../components/PageHeader'

interface Order {
  id: string
  customer: string
  items: string
  total: string
  status: 'Delivered' | 'Pending' | 'Cancelled' | 'Processing'
  time: string
}

interface ActivityItem {
  id: number
  text: string
  user: string
  time: string
  dotColor: string
}

const ORDERS: Order[] = [
  { id: '#BC-9841', customer: 'Ahmed Ramadan',    items: 'Burger + Fries',        total: '$24.50', status: 'Delivered',  time: '2 min ago'  },
  { id: '#BC-9840', customer: 'Sara El-Sayed',    items: 'Grilled Chicken Wrap',  total: '$18.00', status: 'Processing', time: '8 min ago'  },
  { id: '#BC-9839', customer: 'Omar Farouk',      items: 'Pizza Margherita x2',   total: '$32.00', status: 'Pending',    time: '15 min ago' },
  { id: '#BC-9838', customer: 'Nada Hassan',      items: 'Caesar Salad + Juice',  total: '$14.75', status: 'Delivered',  time: '22 min ago' },
  { id: '#BC-9837', customer: 'Khaled Ibrahim',   items: 'Steak Plate',           total: '$45.00', status: 'Cancelled',  time: '35 min ago' },
  { id: '#BC-9836', customer: 'Mona Sherif',      items: 'Sushi Platter',         total: '$52.00', status: 'Delivered',  time: '1 hr ago'   },
  { id: '#BC-9835', customer: 'Yousef Mahmoud',   items: 'Vegan Bowl + Smoothie', total: '$20.00', status: 'Processing', time: '1 hr ago'   },
]

const ACTIVITY: ActivityItem[] = [
  { id: 1, text: 'New order placed by',     user: 'Ahmed Ramadan',   time: '2 min ago',  dotColor: 'var(--success)' },
  { id: 2, text: 'Order cancelled by',      user: 'Khaled Ibrahim',  time: '35 min ago', dotColor: 'var(--danger)'  },
  { id: 3, text: 'New user registered:',    user: 'Sara El-Sayed',   time: '1 hr ago',   dotColor: 'var(--info)'    },
  { id: 4, text: 'Menu item updated by',    user: 'Admin',           time: '2 hr ago',   dotColor: 'var(--warning)' },
  { id: 5, text: 'Payment confirmed for',   user: 'Mona Sherif',     time: '2 hr ago',   dotColor: 'var(--success)' },
  { id: 6, text: 'Support ticket from',     user: 'Omar Farouk',     time: '3 hr ago',   dotColor: 'var(--warning)' },
]

export function DashboardPage() {
  const { t } = useLocale()

  return (
    <div className="page-content">
      <PageHeader title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} />

      <div className="stats-grid">
        <StatCard label={t('dashboard.totalRevenue')} value="$48,295" change="+12.5%" direction="up" icon="💰" iconBg="var(--success-bg)" />
        <StatCard label={t('dashboard.totalOrders')} value="3,842" change="+8.3%" direction="up" icon="🧾" iconBg="var(--info-bg)" />
        <StatCard label={t('dashboard.activeUsers')} value="1,204" change="+5.1%" direction="up" icon="👥" iconBg="rgba(139,91,246,0.15)" />
        <StatCard label={t('dashboard.cancelled')} value="47" change="-2.4%" direction="down" icon="❌" iconBg="var(--danger-bg)" />
      </div>

      <div className="content-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">{t('dashboard.recentOrders')}</span>
            <span className="card-action">{t('common.view')} →</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{t('orders.fields.customer')}</th>
                  <th>{t('orders.fields.items')}</th>
                  <th>{t('orders.fields.total')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('orders.fields.time')}</th>
                </tr>
              </thead>
              <tbody>
                {ORDERS.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.customer}</td>
                    <td>{o.items}</td>
                    <td>{o.total}</td>
                    <td><StatusBadge status={o.status.toLowerCase()} /></td>
                    <td>{o.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">{t('dashboard.recentActivity')}</span>
          </div>
          <div className="activity-list">
            {ACTIVITY.map((a) => (
              <div key={a.id} className="activity-item">
                <span className="activity-dot" style={{ background: a.dotColor }} />
                <div className="activity-body">
                  <div className="activity-text">
                    {a.text} <strong>{a.user}</strong>
                  </div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
