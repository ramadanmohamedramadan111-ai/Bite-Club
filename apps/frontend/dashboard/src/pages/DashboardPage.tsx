import {
  ArrowRight,
  Box,
  Coffee,
  CreditCard,
  PackageOpen,
  ShoppingBag,
  Truck,
  Users,
  Warehouse,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { AppShell } from '../components/layout/AppShell'

const stats = [
  { label: 'Total Revenue', value: '125,430 EGP', note: '+12%', icon: Warehouse, badge: '+12%' },
  { label: "Today's Revenue", value: '8,200 EGP', note: '+4%', icon: CreditCard, badge: '+4%' },
  { label: 'Orders Today', value: '42', note: '-2%', icon: ShoppingBag, badge: '-2%' },
  { label: 'Active Orders', value: '12', note: 'live', icon: Truck, badge: 'Live' },
  { label: 'Avg. Order Value', value: '195 EGP', note: '+18%', icon: Coffee, badge: '+18%' },
  { label: 'Customers / Mo', value: '1,240', note: '+28%', icon: Users, badge: '+28%' },
]

const recentOrders = [
  { id: '#BC-9921', customer: 'Ahmed Mansour', status: 'Preparing', items: '3 items', total: '450 EGP' },
  { id: '#BC-9920', customer: 'Sarah Khalil', status: 'Out for Delivery', items: '1 item', total: '120 EGP' },
  { id: '#BC-9919', customer: 'Omar Farouk', status: 'Delivered', items: '2 items', total: '310 EGP' },
  { id: '#BC-9918', customer: 'Dina Mourad', status: 'Delivered', items: '4 items', total: '585 EGP' },
  { id: '#BC-9917', customer: 'Guest User', status: 'Cancelled', items: '1 item', total: '85 EGP' },
]

const lowStock = [
  { item: 'Wagyu Patties', note: 'Only 8 units left', icon: Box, badge: 'Low' },
  { item: 'Brioche Buns', note: 'Only 24 units left', icon: PackageOpen, badge: 'Low' },
  { item: 'Truffle Mayo', note: '12 units left (Restock soon)', icon: Coffee, badge: 'Warning' },
]

export function DashboardPage() {
  const logout = useAuthStore((state) => state.logout)

  return (
    <AppShell>
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="flex flex-col gap-5 rounded-[32px] border border-brand-muted/70 bg-white p-6 shadow-panel lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-slate">Operations Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold text-brand-navy sm:text-4xl">Real-time performance metrics for BiteClub Main Branch</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-3xl border border-brand-muted/80 bg-brand-surface px-4 py-3 text-sm font-semibold text-brand-navy transition hover:border-brand-orange hover:text-brand-orange">
              This Week
            </button>
            <button className="inline-flex items-center gap-2 rounded-3xl bg-brand-orange px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95">
              <ArrowRight size={16} />
              Export PDF
            </button>
           
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <article key={stat.label} className="rounded-[28px] border border-brand-muted/70 bg-white p-5 shadow-panel">
                <div className="flex items-center justify-between gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-3xl bg-brand-surface text-brand-orange">
                    <Icon size={18} />
                  </div>
                  <span className="rounded-full bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-navy">
                    {stat.badge}
                  </span>
                </div>
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.24em] text-brand-slate">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-brand-navy">{stat.value}</p>
                <p className="mt-2 text-sm text-brand-slate">{stat.note}</p>
              </article>
            )
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <article className="rounded-[32px] border border-brand-muted/70 bg-white p-6 shadow-panel">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-slate">Revenue Trend</p>
                <h2 className="mt-3 text-2xl font-semibold text-brand-navy">Revenue Trend</h2>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-brand-surface px-4 py-2 text-sm font-semibold text-brand-slate">
                <span className="h-2 w-2 rounded-full bg-brand-orange" /> Revenue
                <span className="h-2 w-2 rounded-full bg-brand-accent" /> Target
              </div>
            </div>
            <div className="mt-6 overflow-hidden rounded-[28px] bg-brand-surface p-5">
              <div className="grid h-60 grid-cols-7 gap-3">
                {[4, 5, 5, 7, 10, 7, 5].map((height, index) => (
                  <div key={index} className="flex items-end justify-center">
                    <div className={`w-full rounded-[24px] ${index === 4 ? 'bg-brand-orange' : 'bg-brand-muted/70'}`} style={{ height: `${height * 1.8}rem` }} />
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="rounded-[32px] border border-brand-muted/70 bg-white p-6 shadow-panel">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-slate">Sales by Category</p>
              </div>
              <span className="rounded-full bg-brand-surface px-3 py-2 text-sm font-semibold text-brand-navy">42% Burgers</span>
            </div>
            <div className="mt-7 flex items-center justify-center">
              <div className="relative h-48 w-48 rounded-full bg-brand-surface">
                <div className="absolute inset-0 rounded-full bg-brand-accent/20" />
                <div className="absolute inset-10 rounded-full bg-white" />
                <div className="absolute inset-8 rounded-full border-8 border-brand-accent" />
                <div className="absolute inset-16 rounded-full bg-brand-accent" />
                <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-brand-navy">42%</div>
              </div>
            </div>
            <ul className="mt-8 space-y-3 text-sm text-brand-slate">
              <li className="flex items-center gap-3 rounded-3xl bg-brand-surface px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-orange" />
                <span>Burgers</span>
                <span className="ml-auto font-semibold text-brand-navy">42%</span>
              </li>
              <li className="flex items-center gap-3 rounded-3xl bg-brand-surface px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-accent" />
                <span>Sides</span>
                <span className="ml-auto font-semibold text-brand-navy">28%</span>
              </li>
              <li className="flex items-center gap-3 rounded-3xl bg-brand-surface px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-warning" />
                <span>Drinks</span>
                <span className="ml-auto font-semibold text-brand-navy">20%</span>
              </li>
              <li className="flex items-center gap-3 rounded-3xl bg-brand-surface px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-danger" />
                <span>Desserts</span>
                <span className="ml-auto font-semibold text-brand-navy">10%</span>
              </li>
            </ul>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <article className="rounded-[32px] border border-brand-muted/70 bg-white p-6 shadow-panel">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-slate">Recent Orders</p>
                <h2 className="mt-3 text-2xl font-semibold text-brand-navy">Recent Orders</h2>
              </div>
              <button className="text-sm font-semibold text-brand-orange">View All</button>
            </div>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-brand-slate">
                <thead className="border-b border-brand-muted/70 text-xs uppercase tracking-[0.24em] text-brand-slate">
                  <tr>
                    <th className="py-4">Order ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Items</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-muted/70">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-brand-surface">
                      <td className="py-4 font-semibold text-brand-navy">{order.id}</td>
                      <td>{order.customer}</td>
                      <td>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            order.status === 'Preparing'
                              ? 'bg-brand-orange/10 text-brand-orange'
                              : order.status === 'Out for Delivery'
                              ? 'bg-brand-accent/10 text-brand-accent'
                              : order.status === 'Delivered'
                              ? 'bg-brand-success/10 text-brand-success'
                              : 'bg-brand-danger/10 text-brand-danger'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>{order.items}</td>
                      <td className="font-semibold text-brand-navy">{order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-[32px] border border-brand-muted/70 bg-white p-6 shadow-panel">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-slate">Low Stock Alerts</p>
              <span className="rounded-full bg-brand-orange-soft px-3 py-2 text-sm font-semibold text-brand-orange">Inventory Audit</span>
            </div>
            <div className="mt-6 space-y-4">
              {lowStock.map((alert) => {
                const Icon = alert.icon
                return (
                  <div key={alert.item} className="flex items-center gap-4 rounded-[24px] border border-brand-muted/70 bg-brand-surface px-4 py-4">
                    <div className="grid h-12 w-12 place-items-center rounded-3xl bg-brand-orange text-white">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-brand-navy">{alert.item}</p>
                      <p className="text-sm text-brand-slate">{alert.note}</p>
                    </div>
                    <span className="ml-auto rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-semibold text-brand-orange">{alert.badge}</span>
                  </div>
                )
              })}
            </div>
          </article>
        </section>

        <article className="rounded-[32px] border border-brand-muted/70 bg-white p-6 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-slate">Orders Trend (Weekly)</p>
              <h2 className="mt-3 text-2xl font-semibold text-brand-navy">Orders Trend</h2>
            </div>
            <div className="flex items-center gap-3 text-sm text-brand-slate">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-surface px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-accent" /> Dine-in
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-surface px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-orange" /> Delivery
              </span>
            </div>
          </div>
          <div className="mt-8 h-56 rounded-[32px] bg-brand-surface p-6">
            <div className="h-full rounded-[28px] bg-white" />
          </div>
        </article>
      </div>
    </AppShell>
  )
}
