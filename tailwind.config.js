/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        casino: {
          gold: '#FFD700',
          dark: '#1a1a2e',
          red: '#dc2626',
          green: '#16a34a'
        }
      },
      fontFamily: {
        'casino': ['Georgia', 'serif']
      }
    },
  },
  plugins: [],
}