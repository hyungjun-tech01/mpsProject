/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './app/[locale]/*.{js,ts,jsx,tsx,mdx}',
    './app/[locale]/**/*.{js,ts,jsx,tsx,mdx}',
    './app/[locale]/(Home)/*.{js,ts,jsx,tsx,mdx}',
    './app/components/*.{js,ts,jsx,tsx,mdx}',
    './app/components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(64px, 1fr))',
      },
    },
  },
  plugins: [],
}

