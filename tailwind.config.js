/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          50: '#F0F3F9',
          100: '#D9E0F0',
          200: '#B4C5E3',
          300: '#8FA9D5',
          400: '#6A8EC8',
          500: '#4672BA',
          600: '#345B9A',
          700: '#2A3A6A', // Lighter nav items
          800: '#1A2A54', // Main header bg
          900: '#101B3A', // Darkest
        },
        brand: {
          orange: '#FF6B00', // vibrant orange
          'orange-light': '#FF8C33',
          'orange-dark': '#E65C00',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    }
  },
  plugins: []
};
