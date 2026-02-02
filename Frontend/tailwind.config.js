/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      zIndex: {
        '50': '50',
        '100': '100',
      },
    },
  },
  plugins: [],
}
