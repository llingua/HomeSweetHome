import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui'],
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        glass: {
          50: 'rgb(var(--glass-50) / <alpha-value>)',
          100: 'rgb(var(--glass-100) / <alpha-value>)',
          200: 'rgb(var(--glass-200) / <alpha-value>)',
          300: 'rgb(var(--glass-300) / <alpha-value>)',
          400: 'rgb(var(--glass-400) / <alpha-value>)',
        },
        accent: 'rgb(var(--accent) / <alpha-value>)',
        accent2: 'rgb(var(--accent-2) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
      },
      boxShadow: {
        glass: '0 10px 30px rgba(9, 20, 40, 0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
        glow: '0 0 30px rgba(109, 208, 255, 0.35)',
      },
      backdropBlur: {
        glass: '18px',
      },
      backgroundImage: {
        'liquid-radial': 'radial-gradient(circle at 20% 0%, rgba(120, 221, 255, 0.35), transparent 40%), radial-gradient(circle at 80% 20%, rgba(255, 205, 158, 0.3), transparent 45%), radial-gradient(circle at 20% 80%, rgba(140, 255, 210, 0.25), transparent 45%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 10s ease-in-out infinite',
        shimmer: 'shimmer 10s ease infinite',
        fadeUp: 'fadeUp 0.6s ease both',
      },
    },
  },
  plugins: [],
};

export default config;
