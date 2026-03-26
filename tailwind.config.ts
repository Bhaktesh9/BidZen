import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: '#63b3ed',
        success: '#48bb78',
        danger: '#fc8181',
        warning: '#f6ad55',
        gold: '#f6c90e',
        sold: '#a78bfa',
        base: '#0a0b0e',
        surface: '#111318',
        card: '#181c24',
        elevated: '#1e2330',
        textPrimary: '#f0f2f7',
        textSecondary: '#8b92a8',
        textMuted: '#4a5068',
      },
      borderColor: {
        subtle: 'rgba(255,255,255,0.07)',
      },
      borderRadius: {
        panel: '12px',
        smpanel: '8px',
      },
      boxShadow: {
        glow: '0 0 32px rgba(99,179,237,0.15)',
      },
    },
  },
  plugins: [],
}
export default config
