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
            }
        },
    },
    plugins: [],
};
