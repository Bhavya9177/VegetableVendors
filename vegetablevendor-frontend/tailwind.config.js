/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16A34A',
          dark: '#15803D',
          light: '#22C55E',
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
        },
        accent: {
          DEFAULT: '#F97316',
          dark: '#EA6F0F',
          light: '#FB923C',
          50: '#FFF7ED',
          100: '#FFEDD5',
        },
        sidebar: {
          DEFAULT: '#111827',
          hover: '#1F2937',
          active: '#16A34A',
          border: '#1F2937',
          text: '#9CA3AF',
          textActive: '#FFFFFF',
        },
        background: '#F1F5F9',
        surface: '#FFFFFF',
        text: '#0F172A',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-lg': '0 4px 16px rgba(0,0,0,0.07)',
        glow: '0 0 0 3px rgba(22,163,74,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.25s ease-out',
        'skeleton': 'skeleton 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        skeleton: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
}
