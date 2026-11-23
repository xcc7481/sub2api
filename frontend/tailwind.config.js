/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand accent — Apple System Blue ramp (WCAG AA/AAA calibrated)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#8ec5ff',
          400: '#389bff',
          500: '#0a84ff',
          600: '#0066cc',
          700: '#0055b3',
          800: '#004494',
          900: '#003575',
          950: '#00214a'
        },
        // Semantic UI design tokens (driven by CSS variables in src/style.css)
        ui: {
          canvas: 'rgb(var(--ui-canvas) / <alpha-value>)',
          surface: 'rgb(var(--ui-surface) / <alpha-value>)',
          elevated: 'rgb(var(--ui-elevated) / <alpha-value>)',
          muted: 'rgb(var(--ui-muted) / <alpha-value>)',
          line: 'rgb(var(--ui-line) / <alpha-value>)',
          focus: 'rgb(var(--ui-focus) / <alpha-value>)',
          ink: 'rgb(var(--ui-ink) / <alpha-value>)',
          subdued: 'rgb(var(--ui-subdued) / <alpha-value>)',
          action: 'rgb(var(--ui-action) / <alpha-value>)',
          'action-hover': 'rgb(var(--ui-action-hover) / <alpha-value>)',
          'on-action': 'rgb(var(--ui-on-action) / <alpha-value>)',
          selected: 'rgb(var(--ui-selected) / <alpha-value>)',
          control: 'rgb(var(--ui-control) / <alpha-value>)',
          'control-hover': 'rgb(var(--ui-control-hover) / <alpha-value>)'
        },
        // Apple Light Neutrals (Porcelain #F5F5F7 -> Ink #1D1D1F)
        gray: {
          50: '#f5f5f7',
          100: '#f2f2f7',
          200: '#e5e5ea',
          300: '#d1d1d6',
          400: '#8e8e93',
          500: '#636368',
          600: '#48484a',
          700: '#3a3a3c',
          800: '#2c2c2e',
          900: '#1d1d1f',
          950: '#0b0b0d'
        },
        // Secondary cool graphite scale
        accent: {
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#d5dde8',
          300: '#b3c1d4',
          400: '#8699b4',
          500: '#627694',
          600: '#495b77',
          700: '#38465d',
          800: '#273142',
          900: '#1a212d',
          950: '#0e131b'
        },
        // Apple Dark Mode Elevation Neutrals (Space Black -> Elevated Graphite)
        dark: {
          50: '#f5f5f7',
          100: '#e5e5ea',
          200: '#d1d1d6',
          300: '#aeaeb2',
          400: '#98989d',
          500: '#6e6e73',
          600: '#48484a',
          700: '#2f2f33',
          800: '#1c1c1e',
          900: '#111113',
          950: '#080809'
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Plus Jakarta Sans Variable',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'Noto Sans SC',
          'system-ui',
          'sans-serif'
        ],
        mono: [
          'JetBrains Mono Variable',
          'ui-monospace',
          'SFMono-Regular',
          'SF Mono',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ]
      },
      boxShadow: {
        glass: '0 12px 32px -10px rgba(0, 0, 0, 0.14)',
        'glass-sm': '0 4px 16px -4px rgba(0, 0, 0, 0.08)',
        card: '0 1px 2px rgba(0, 0, 0, 0.04), 0 0 0 0.5px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 26px -10px rgba(0, 0, 0, 0.12), 0 2px 6px -2px rgba(0, 0, 0, 0.05)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.08)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-dark': 'linear-gradient(135deg, #1c1c1e 0%, #0b0b0d 100%)',
        'gradient-glass':
          'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)'
      },
      animation: {
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.16s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(14px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      backdropBlur: {
        xs: '2px'
      },
      borderRadius: {
        '4xl': '2rem'
      }
    }
  },
  plugins: []
}
