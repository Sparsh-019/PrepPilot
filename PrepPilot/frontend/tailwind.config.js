/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        white: 'hsl(var(--color-white) / <alpha-value>)',
        slate: Object.fromEntries(
          [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => [
            shade,
            `hsl(var(--color-slate-${shade}) / <alpha-value>)`,
          ])
        ),
        brand: {
          50: 'hsl(var(--color-brand-50) / <alpha-value>)',
          100: 'hsl(var(--color-brand-100) / <alpha-value>)',
          500: 'hsl(var(--color-brand-500) / <alpha-value>)',
          600: 'hsl(var(--color-brand-600) / <alpha-value>)',
          700: 'hsl(var(--color-brand-700) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};
