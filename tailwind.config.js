/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dracula Theme
        drac: {
          bg:       '#282a36',
          bgAlt:    '#21222c',
          surface:  '#44475a',
          surface2: '#373948',
          comment:  '#6272a4',
          fg:       '#f8f8f2',
          purple:   '#bd93f9',
          pink:     '#ff79c6',
          cyan:     '#8be9fd',
          green:    '#50fa7b',
          red:      '#ff5555',
          orange:   '#ffb86c',
          yellow:   '#f1fa8c',
        },
        // Keep brand as alias for purple
        brand: {
          50:  '#f0eaff',
          100: '#e0d4ff',
          200: '#c9aaff',
          400: '#bd93f9',
          600: '#bd93f9',
          700: '#a675f5',
          800: '#8c56f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'drac-sm':  '0 2px 8px rgba(40,42,54,0.6)',
        'drac-md':  '0 4px 20px rgba(40,42,54,0.7)',
        'drac-glow-purple': '0 0 20px rgba(189,147,249,0.25)',
        'drac-glow-pink':   '0 0 20px rgba(255,121,198,0.25)',
        'drac-glow-cyan':   '0 0 20px rgba(139,233,253,0.2)',
      }
    }
  },
  plugins: []
}
