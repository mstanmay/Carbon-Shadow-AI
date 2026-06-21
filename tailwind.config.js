/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '"Noto Sans Devanagari"', '"Noto Sans Kannada"', '"Noto Sans Tamil"', '"Noto Sans Telugu"', '"Noto Sans Malayalam"', '"Noto Sans Bengali"', '"Noto Sans Gujarati"', 'sans-serif'],
      },
      colors: {
        'theme-bg': 'var(--bg-primary)',
        'theme-bg-secondary': 'var(--bg-secondary)',
        'theme-bg-tertiary': 'var(--bg-tertiary)',
        'theme-surface': 'var(--surface)',
        'theme-text': 'var(--text-primary)',
        'theme-text-secondary': 'var(--text-secondary)',
        'theme-text-muted': 'var(--text-muted)',
        'theme-text-dim': 'var(--text-dim)',
        'theme-accent': 'var(--accent)',
        'theme-accent-light': 'var(--accent-light)',
        'theme-accent-secondary': 'var(--accent-secondary)',
        'theme-accent-tertiary': 'var(--accent-tertiary)',
        'theme-border': 'var(--border)',
        'theme-danger': 'var(--danger)',
        'theme-warning': 'var(--warning)',
        'theme-success': 'var(--success)',
        'theme-info': 'var(--info)',
      },
      boxShadow: {
        'glow': '0 0 30px var(--accent-glow)',
        'glow-strong': '0 0 40px var(--accent-glow-strong)',
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'fade-down': 'fade-down 0.5s ease-out both',
      },
    },
  },
  plugins: [],
}
