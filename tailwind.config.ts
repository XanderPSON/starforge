import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coinbase: {
          blue: '#0052FF',
          dark: '#0A1F44',
          'dark-bg': '#05111F',
          'space': '#0D1B2A',
          'space-light': '#1B263B',
          'purple': '#5B21B6',
          'cyan': '#06B6D4',
        },
        hub: {
          bg: '#f7f8fb',
          surface: '#ffffff',
          'surface-alt': '#eef1f7',
          text: '#141621',
          muted: '#5b6270',
          primary: '#4c5bff',
          'primary-dark': '#2f3be6',
          accent: '#12b5a6',
        },
      },
      backgroundImage: {
        'interstellar': 'linear-gradient(135deg, #0A1F44 0%, #0D1B2A 50%, #1B263B 100%)',
        'coinbase-gradient': 'linear-gradient(135deg, #0052FF 0%, #5B21B6 100%)',
        'space-gradient': 'radial-gradient(ellipse at top, #1B263B 0%, #0D1B2A 50%, #05111F 100%)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '75ch',
            color: '#141621',
            a: {
              color: '#4c5bff',
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': {
                color: '#2f3be6',
                textDecoration: 'underline',
              },
            },
            h1: {
              fontSize: '1.875rem',
              fontWeight: '700',
              marginTop: '0',
              marginBottom: '1.5rem',
              color: '#141621',
            },
            h2: {
              fontSize: '1.5rem',
              fontWeight: '600',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              color: '#141621',
              borderBottom: '2px solid #4c5bff',
              paddingBottom: '0.5rem',
            },
            h3: {
              fontSize: '1.25rem',
              fontWeight: '600',
              marginTop: '2rem',
              marginBottom: '0.75rem',
              color: '#141621',
            },
            h4: { color: '#141621' },
            h5: { color: '#141621' },
            h6: { color: '#141621' },
            p: {
              color: '#4b5563',
              lineHeight: '1.8',
            },
            strong: {
              color: '#141621',
              fontWeight: '600',
            },
            code: {
              backgroundColor: '#eef1f7',
              color: '#4c5bff',
              padding: '0.2rem 0.45rem',
              borderRadius: '0.375rem',
              fontWeight: '500',
              border: '1px solid rgba(76,91,255,0.15)',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
              borderRadius: '0',
              fontSize: '0.875rem',
              lineHeight: '1.7',
              color: '#e5e7eb',
              border: 'none',
            },
            pre: {
              backgroundColor: '#1e293b',
              color: '#e5e7eb',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              overflowX: 'auto',
              lineHeight: '1.7',
              border: '1px solid rgba(255,255,255,0.08)',
            },
            ul: { color: '#374151' },
            ol: { color: '#374151' },
            li: {
              color: '#374151',
              '&::marker': { color: '#4c5bff' },
            },
            blockquote: {
              color: '#5b6270',
              borderLeftColor: '#4c5bff',
              borderLeftWidth: '4px',
              backgroundColor: '#eef1f7',
              padding: '1rem 1.5rem',
              borderRadius: '0.5rem',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config
