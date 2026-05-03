/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      base: 'var(--bg-base)',
      panel: 'var(--bg-panel)',
      overlay: 'var(--bg-overlay)',
      active: 'var(--bg-active)',
      'text-primary': 'var(--text-primary)',
      'text-secondary': 'var(--text-secondary)',
      'text-muted': 'var(--text-muted)',
      'border-default': 'var(--border-default)',
      'border-hover': 'var(--border-hover)',
      'border-active': 'var(--border-active)',
      'border-strong': 'var(--border-strong)',
      'border-subtle': 'var(--border-subtle)',
      'elevated': 'var(--bg-elevated)',
      'accent-violet': 'var(--accent-violet)',
      'accent-violet-hover': 'var(--accent-violet-hover)',
      'accent-violet-transparent': 'var(--accent-violet-transparent)',
      'accent-cyan': 'var(--accent-cyan)',
      error: 'var(--color-error)',
      warning: 'var(--color-warning)',
      success: 'var(--color-success)',
    },
    extend: {
      fontFamily: {
        ui: ['var(--font-ui)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        // Add minimal strict px spacing for grid rhythms
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
      keyframes: {
        'palette-open': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'palette-close': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.97)' },
        },
        'fadeScaleIn': {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      },
      animation: {
        'palette-open': 'palette-open 120ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'palette-close': 'palette-close 80ms cubic-bezier(0.4, 0, 1, 1) forwards',
      }
    },
  },
  plugins: [],
}
