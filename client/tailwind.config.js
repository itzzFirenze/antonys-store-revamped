/** @type {import('tailwindcss').Config} */
import flowbite from 'flowbite-react/tailwind';

export default {
   content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
      flowbite.content(),
   ],
   theme: {
      extend: {
         maxWidth: {
            '80rem': '80rem', // Custom value
         },
         padding: {
            '250px': '250px',
         },
         colors: {
            primary: {
               "50": "#eff6ff",
               "100": "#dbeafe",
               "200": "#bfdbfe",
               "300": "#93c5fd",
               "400": "#60a5fa",
               "500": "#3b82f6",
               "600": "#2563eb",
               "700": "#1d4ed8",
               "800": "#1e40af",
               "900": "#1e3a8a",
               "950": "#172554",
            },
         },
         fontFamily: {
            poppins: ["Poppins", "sans-serif"],
            body: [
               "Inter",
               "ui-sans-serif",
               "system-ui",
               "-apple-system",
               "system-ui",
               "Segoe UI",
               "Roboto",
               "Helvetica Neue",
               "Arial",
               "Noto Sans",
               "sans-serif",
               "Apple Color Emoji",
               "Segoe UI Emoji",
               "Segoe UI Symbol",
               "Noto Color Emoji",
            ],
            sans: [
               "Inter",
               "ui-sans-serif",
               "system-ui",
               "-apple-system",
               "system-ui",
               "Segoe UI",
               "Roboto",
               "Helvetica Neue",
               "Arial",
               "Noto Sans",
               "sans-serif",
               "Apple Color Emoji",
               "Segoe UI Emoji",
               "Segoe UI Symbol",
               "Noto Color Emoji",
            ],
         },
         animation: {
            'fade-up': 'fadeUp 0.6s ease-out',
            'fade-up-delay': 'fadeUp 0.6s ease-out 0.2s', // Add delay for staggered animations
            'slow-bounce': 'slow-bounce 2s infinite', // Adjust the duration (e.g., 2s)
         },
         keyframes: {
            fadeUp: {
               '0%': {
                  opacity: 0,
                  transform: 'translateY(20px)', // Start 20px below
               },
               '100%': {
                  opacity: 1,
                  transform: 'translateY(0)', // End at normal position
               },
            },
            'slow-bounce': {
               '0%, 100%': { transform: 'translateY(0)' },
               '50%': { transform: 'translateY(-10px)' }, // Adjust the height as needed
            },
         },
         transitionDuration: {
            '1000': '1000ms', // Set custom transition duration
         },
      },
   },
   plugins: [
      flowbite.plugin(),
   ],
};
