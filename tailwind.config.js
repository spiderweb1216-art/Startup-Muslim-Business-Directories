/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        canvas: '#F3F0E8',   // warm canvas
        sand: '#E8E0D2',
        sandLight: '#EEE7D9',
        paper: '#FFFFFF',
        ink: '#0B0F14',
        navy: '#111827',     // deep midnight navy
        charcoal: '#1D232E',
        slate2: '#667085',
        slate3: '#8A94A6',
        line: '#DED5C4',
        lineDark: '#242C39',
        coral: '#D94B3D',
        coralDark: '#B7382C',
        coralSoft: '#F5DFD9',
        emerald: '#176B58',
        emeraldSoft: '#DDEBE4',
        amber: '#B08040',
        amberSoft: '#F3E6D0',
        lavender: '#8D82D8',
        // shadcn compat (kept minimal)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        primary: { DEFAULT: '#D94B3D', foreground: '#FFFFFF' },
        secondary: { DEFAULT: '#E8E0D2', foreground: '#0B0F14' },
        muted: { DEFAULT: '#E8E0D2', foreground: '#667085' },
        accent: { DEFAULT: '#111827', foreground: '#FFFFFF' },
        destructive: { DEFAULT: '#D94B3D', foreground: '#FFFFFF' },
        card: { DEFAULT: '#FFFFFF', foreground: '#0B0F14' },
        popover: { DEFAULT: '#FFFFFF', foreground: '#0B0F14' },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
