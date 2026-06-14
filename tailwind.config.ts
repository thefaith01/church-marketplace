import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5EEE1',
        paper: '#FCF8F1',
        ink: '#2A2018',
        clay: { DEFAULT: '#C05A36', dark: '#A8472A' },
        forest: '#2E5740',
        honey: '#DDA23A',
        muted: '#6F6456',
        faint: '#9A8C76',
        line: '#EBE1CE',
        chip: '#EDE3D0',
        sage: '#E4EBDD',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        sans: ['"Hanken Grotesk"', 'sans-serif'],
        serif: ['"Newsreader"', 'serif'],
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floaty2: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(8px)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        floaty2: 'floaty2 5s ease-in-out infinite',
        ticker: 'ticker 36s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
