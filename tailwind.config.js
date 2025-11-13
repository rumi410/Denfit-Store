/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
            'denfit-blue': '#2563eb',
            'denfit-dark': '#0f172a',
            'social-facebook': '#1877F2',
            'social-instagram': '#E4405F',
            'social-twitter': '#1DA1F2',
            'social-youtube': '#FF0000',
            'social-tiktok': '#000000',
        },
        animation: {
            'fade-in': 'fadeIn 0.3s ease-out forwards',
            'fade-in-down': 'fadeInDown 0.5s ease-out forwards',
            'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
            'scale-in': 'scaleIn 0.3s ease-out forwards',
            'zoom-in': 'zoomIn 10s ease-out forwards',
        },
        keyframes: {
            fadeIn: {
                '0%': { opacity: '0' },
                '100%': { opacity: '1' },
            },
            fadeInDown: {
              '0%': { opacity: '0', transform: 'translateY(-20px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            fadeInUp: {
                '0%': { opacity: '0', transform: 'translateY(20px)' },
                '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            scaleIn: {
                '0%': { transform: 'scale(0.95)', opacity: '0' },
                '100%': { transform: 'scale(1)', opacity: '1' },
            },
            zoomIn: {
              '0%': { transform: 'scale(1)' },
              '100%': { transform: 'scale(1.1)' },
            }
        }
    },
  },
  plugins: [],
}
