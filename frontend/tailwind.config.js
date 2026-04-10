/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background hierarchy
        canvas: '#09090B',
        surface: '#121214',
        'surface-raised': '#1A1A1D',
        'surface-overlay': '#222226',

        // Text hierarchy
        foreground: '#FAFAFA',
        muted: '#A1A1AA',
        subtle: '#52525B',
        disabled: '#3F3F46',

        // Accent - Emerald (primary)
        emerald: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },

        // Accent - Blue (secondary, for Screener)
        blue: {
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
        },

        // Accent - Purple (tertiary, for QuantGen)
        purple: {
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
        },

        // Semantic
        positive: '#10B981',
        negative: '#EF4444',
        warning: '#F59E0B',

        // Zinc scale (extended)
        zinc: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
        }
      },
      screens: {
        '3xl': '2560px',
        '4xl': '3840px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display': ['72px', { lineHeight: '1', letterSpacing: '-0.04em' }],
        'section': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'page': ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'metric-lg': ['48px', { lineHeight: '1', letterSpacing: '0' }],
        'metric': ['24px', { lineHeight: '1.1', letterSpacing: '0' }],
        'metric-sm': ['16px', { lineHeight: '1.2', letterSpacing: '0' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '150': '150px',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '24px',
        'full': '9999px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(16, 185, 129, 0.2)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.2)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.2)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'elevated': '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.15' },
          '50%': { opacity: '0.25' },
        },
      },
    },
  },
  plugins: [],
}