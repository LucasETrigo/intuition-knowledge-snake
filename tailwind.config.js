/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
    theme: {
        extend: {
            borderRadius: {
                xl: '0.875rem',
                '2xl': '1.25rem',
            },
            boxShadow: {
                card: '0 10px 30px -12px rgba(0,0,0,0.2)',
            },
            backdropBlur: {
                lg: '16px',
            },
            animation: {
                fadeIn: 'fadeIn 200ms ease-out',
                slideUp: 'slideUp 300ms ease-out',
            },
            keyframes: {
                fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
                slideUp: {
                    '0%': { transform: 'translateY(6px)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 },
                },
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
};
