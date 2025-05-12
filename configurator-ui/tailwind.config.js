/** @type {import('tailwindcss').Config} */
export default {
    content: [
      './index.html',
      './src/**/*.{svelte,js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        colors: {
          'primary': '#0B93F6', // iPhone chat bubble blue
          'secondary': '#E5E5EA', // iPhone visitor bubble gray
          'dark-primary': '#007AFF',
          'dark-secondary': '#323232',
          'accent': '#34C759', // iOS green
        }
      },
    },
    plugins: [],
  }