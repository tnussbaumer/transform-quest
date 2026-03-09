/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'tq-bg':           '#1A1D2E',
        'tq-surface':      '#232740',
        'tq-surface-2':    '#2D3154',
        'tq-teal':         '#00C9A7',
        'tq-teal-light':   '#33FFD4',
        'tq-teal-dark':    '#009B82',
        'tq-gold':         '#FFB830',
        'tq-gold-light':   '#FFD470',
        'tq-gold-dark':    '#E09800',
        'tq-purple':       '#8B5CF6',
        'tq-purple-light': '#A78BFA',
        'tq-purple-dark':  '#7340E0',
        'tq-success':      '#34D399',
        'tq-warning':      '#FBBF24',
        'tq-error':        '#F87171',
        'tq-text':         '#F1F5F9',
        'tq-text-sec':     '#94A3B8',
        'tq-text-muted':   '#64748B',
        'tq-border':       '#334155',
      },
      fontFamily: {
        nunito: ['Nunito', 'Nunito Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.1', fontWeight: '900' }],
      },
    },
  },
  plugins: [],
}
