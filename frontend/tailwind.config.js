/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f2f8',
          100: '#e2e7f3',
          200: '#cdd6ec',
          300: '#b5c2e7',
          400: '#96a7d5',
          500: '#6677a5',
          600: '#434f7a',
          700: '#37436a',
          800: '#293659',
          900: '#222c46',
          950: '#181f32'
        },
        ui: {
          canvas: 'rgb(var(--ui-canvas) / <alpha-value>)',
          surface: 'rgb(var(--ui-surface) / <alpha-value>)',
          muted: 'rgb(var(--ui-muted) / <alpha-value>)',
          line: 'rgb(var(--ui-line) / <alpha-value>)',
          focus: 'rgb(var(--ui-focus) / <alpha-value>)',
          ink: 'rgb(var(--ui-ink) / <alpha-value>)',
          subdued: 'rgb(var(--ui-subdued) / <alpha-value>)',
          action: 'rgb(var(--ui-action) / <alpha-value>)',
          'action-hover': 'rgb(var(--ui-action-hover) / <alpha-value>)',
          'on-action': 'rgb(var(--ui-on-action) / <alpha-value>)',
          selected: 'rgb(var(--ui-selected) / <alpha-value>)',
          control: 'rgb(var(--ui-control) / <alpha-value>)'
        },
        gray: {
          50: '#f5f5f7',
          100: '#ededf0',
          200: '#e0e0e5',
          300: '#ccccd3',
          400: '#86868b',
          500: '#68686f',
          600: '#515154',
          700: '#3a3a40',
          800: '#29292e',
          900: '#1d1d1f',
          950: '#101012'
        },
        // 辅助色 - 深蓝灰
        accent: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        },
        dark: {
          50: '#fafafa',
          100: '#f5f5f7',
          200: '#e9e9ed',
          300: '#d4d4db',
          400: '#b4b4bf',
          500: '#9898a4',
          600: '#656570',
          700: '#3a3a42',
          800: '#28282e',
          900: '#1c1c20',
          950: '#111113'
        }
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'sans-serif'
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glass-sm': '0 4px 16px rgba(0, 0, 0, 0.06)',
        card: '0 1px 3px rgba(16, 16, 18, 0.04)',
        'card-hover': '0 6px 24px rgba(16, 16, 18, 0.08)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-dark': 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        'gradient-glass':
          'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
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
