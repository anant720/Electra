/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'electra-navy':  '#102A43',
        'insight-blue':  '#0070F3',
        'civic-gold':    '#D4AF37',
        'neutral-gray':  '#F0F4F8',
        'slate-gray':    '#52606D',
        'emergency-red': '#C0392B',
        'warning-amber': '#D97706',
        'success-green': '#16A34A',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        civic:  '12px',
        button: '8px',
      },
      boxShadow: {
        card:       '0 1px 3px rgba(16,42,67,0.06), 0 1px 2px rgba(16,42,67,0.04)',
        'card-hover': '0 4px 12px rgba(16,42,67,0.10)',
        'focus-blue': '0 0 0 3px rgba(0,112,243,0.25)',
      },
      animation: {
        'pulse-ring': 'pulse-ring 2000ms ease-out infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(192,57,43,0.5)' },
          '70%': { boxShadow: '0 0 0 12px rgba(192,57,43,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(192,57,43,0)' },
        },
      },
    },
  },
  plugins: [],
};
