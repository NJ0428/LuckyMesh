/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Pastel Background Colors
        'pastel-pink': '#FFE1E6',
        'pastel-lavender': '#E8E1FF',
        'pastel-mint': '#E1FFF1',
        'pastel-peach': '#FFE8D1',
        'pastel-sky': '#D1E8FF',
        'pastel-cream': '#FFF8E1',

        // Primary Warm Colors
        'primary-soft-pink': '#F4A261',
        'primary-soft-purple': '#E76F51',
        'primary-soft-mint': '#2A9D8F',
        'primary-soft-peach': '#E9C46A',
        'primary-soft-blue': '#264653',

        // Accent Warm Colors
        'accent-rose-gold': '#F4A261',
        'accent-lavender-mist': '#E76F51',
        'accent-mint-cream': '#2A9D8F',
        'accent-coral': '#E9C46A',
        'accent-powder-blue': '#264653',

        // Legacy casino colors (for backward compatibility)
        casino: {
          gold: '#F4A261', // Changed to warm gold
          dark: '#264653', // Changed to warm dark
          red: '#E76F51', // Changed to warm red
          green: '#2A9D8F' // Changed to warm green
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