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
          DEFAULT: '#2563eb', // blue-600
          hover: '#1d4ed8',   // blue-700
          light: '#eff6ff',   // blue-50
        },
        success: {
          DEFAULT: '#10b981', // emerald-500
          hover: '#059669',
          light: '#ecfdf5',   // emerald-50
        },
        danger: {
          DEFAULT: '#ef4444', // red-500
          hover: '#dc2626',
          light: '#fef2f2',   // red-50
        },
        warning: {
          DEFAULT: '#f59e0b', // amber-500
          hover: '#d97706',
          light: '#fffbeb',
        }
      }
    },
  },
  plugins: [],
}
