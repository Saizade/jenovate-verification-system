export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef8fb',
          100: '#d9edf4',
          200: '#b9dce8',
          300: '#8fc5d8',
          400: '#66a9c1',
          500: '#438ca9',
          600: '#34758f',
          700: '#2c6177',
          800: '#285165',
          900: '#234554',
          950: '#173543'
        },
        accent: {
          50: '#eef8fb',
          100: '#d9edf4',
          200: '#b9dce8',
          300: '#8fc5d8',
          400: '#66a9c1',
          500: '#438ca9',
          600: '#34758f',
          700: '#2c6177',
          800: '#285165',
          900: '#234554',
          950: '#173543'
        },
        indigo: {
          50: '#eef8fb', 100: '#d9edf4', 200: '#b9dce8', 300: '#8fc5d8', 400: '#66a9c1', 500: '#438ca9', 600: '#34758f', 700: '#2c6177', 800: '#285165', 900: '#234554', 950: '#173543'
        },
        violet: {
          50: '#f3f5f8', 100: '#e5eaf0', 200: '#cdd7e1', 300: '#aab9c7', 400: '#7f95a7', 500: '#607c91', 600: '#4d6779', 700: '#3e5566', 800: '#334754', 900: '#2a3b46', 950: '#1e2d36'
        },
        beige: {
          50: '#f7fcfd',
          100: '#eef8fb',
          200: '#d9edf4',
          300: '#b9dce8',
          400: '#8fc5d8',
          500: '#66a9c1'
        },
        surface: {
          50: '#ffffff',
          100: '#f8fafc',
          200: '#eef2f5'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'count-up': 'countUp 1s ease-out',
        'bounce-soft': 'bounceSoft 0.5s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInLeft: { '0%': { opacity: '0', transform: 'translateX(-20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.98)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        bounceSoft: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } }
      },
      boxShadow: {
        'glass': '0 12px 32px rgba(35, 82, 101, 0.08)',
        'card': '0 1px 3px rgba(24, 51, 68, 0.06), 0 8px 22px rgba(24, 51, 68, 0.05)',
        'card-hover': '0 6px 16px rgba(24, 51, 68, 0.10), 0 18px 34px rgba(24, 51, 68, 0.08)',
        'elevated': '0 20px 46px rgba(24, 51, 68, 0.12)',
      }
    }
  },
  plugins: []
}
