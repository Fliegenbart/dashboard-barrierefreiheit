/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#005a9c',
          dark: '#003d6b',
        },
        success: '#2e7d32',
        warning: '#f57c00',
        error: '#c62828',
        focus: '#ff6f00',
      },
    },
  },
  plugins: [],
}
