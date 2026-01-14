/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                hand: ['Kalam', 'cursive'], // For that hand-drawn feel
            },
            colors: {
                primary: '#3b82f6',
                app: {
                    bg: '#141414',
                    surface: '#1C1C1C',
                    border: '#2C2C2C',
                    'surface-hover': '#252525',
                    // Light Mode (Neutral Gray)
                    light: {
                        bg: '#FFFFFF',
                        surface: '#F9FAFB', // Gray-50
                        border: '#E5E7EB',  // Gray-200
                        'surface-hover': '#F3F4F6', // Gray-100
                    }
                },
                // Unified Accent System (Indigo)
                accent: {
                    DEFAULT: '#4F46E5', // Indigo-600
                    hover: '#4338CA',   // Indigo-700
                    light: '#6366F1',   // Indigo-500
                    subtle: '#818CF8',  // Indigo-400
                },
            },
            animation: {
                blob: "blob 7s infinite",
            },
            keyframes: {
                blob: {
                    "0%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                    "33%": {
                        transform: "translate(30px, -50px) scale(1.1)",
                    },
                    "66%": {
                        transform: "translate(-20px, 20px) scale(0.9)",
                    },
                    "100%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                },
            },
        },
    },
    plugins: [
        function ({ addUtilities }) {
            addUtilities({
                ".animation-delay-2000": {
                    "animation-delay": "2s",
                },
                ".animation-delay-4000": {
                    "animation-delay": "4s",
                },
            });
        },
    ],
};
