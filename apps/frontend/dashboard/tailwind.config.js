/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: 'var(--brand-orange)',
          orangeSoft: 'var(--brand-orange-soft)',
          navy: 'var(--brand-navy)',
          slate: 'var(--brand-slate)',
          surface: 'var(--brand-surface)',
          muted: 'var(--brand-muted)',
          card: 'var(--brand-card)',
          accent: 'var(--brand-accent)',
          success: 'var(--brand-success)',
          warning: 'var(--brand-warning)',
          danger: 'var(--brand-danger)',
        },
      },
      boxShadow: {
        panel: '0 24px 80px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}
