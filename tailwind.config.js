/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Pastel Casino Color Palette
        'pastel-pink': '#FFE1E6',
        'pastel-lavender': '#E8E1FF',
        'pastel-mint': '#E1FFF1',
        'pastel-peach': '#FFE8D1',
        'pastel-sky': '#D1E8FF',
        'pastel-cream': '#FFF8E1',

        // Primary Colors
        'primary-soft-pink': '#F8BBD9',
        'primary-soft-purple': '#C8A2C8',
        'primary-soft-mint': '#B8E6CC',
        'primary-soft-peach': '#FFCAB0',
        'primary-soft-blue': '#A8D8EA',

        // Accent Colors
        'accent-rose-gold': '#F7CAC9',
        'accent-lavender-mist': '#DDA0DD',
        'accent-mint-cream': '#98FB98',
        'accent-coral': '#FF9999',
        'accent-powder-blue': '#B0E0E6',

        // Legacy casino colors (for backward compatibility)
        casino: {
          gold: '#F7CAC9', // Changed to pastel rose gold
          dark: '#FAFAFA', // Changed to light neutral
          red: '#FF9999', // Changed to pastel coral
          green: '#98FB98' // Changed to pastel mint
        }
      },
      fontFamily: {
        'casino': ['Inter', 'Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'playfair': ['Playfair Display', 'serif']
      },
      backgroundImage: {
        'pastel-gradient': 'linear-gradient(135deg, #FFE1E6 0%, #E8E1FF 25%, #E1FFF1 50%, #FFE8D1 75%, #D1E8FF 100%)',
        'pink-purple': 'linear-gradient(135deg, #FFE1E6 0%, #E8E1FF 100%)',
        'mint-sky': 'linear-gradient(135deg, #E1FFF1 0%, #D1E8FF 100%)',
        'peach-cream': 'linear-gradient(135deg, #FFE8D1 0%, #FFF8E1 100%)'
      }
    },
  },
  plugins: [],
}