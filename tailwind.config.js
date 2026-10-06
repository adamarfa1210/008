/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        surface: {
          DEFAULT: '#111827',
          hover: '#1F2937',
        },
        border: {
          subtle: '#374151',
          highlight: '#4B5563',
        },
        cyber: {
          blue: '#0EA5E9',
          indigo: '#6366F1',
        },
        telemetry: {
          temp: '#F59E0B',
          humidity: '#06B6D4',
          online: '#10B981',
          offline: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-sky': '0 0 20px rgba(14, 165, 233, 0.25)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.2)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.2)',
        'glow-emerald': '0 0 15px rgba(16, 185, 129, 0.3)',
      }
    },
  },
  plugins: [],
}
