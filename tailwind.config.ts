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
            color: '#E5E7EB',
            a: {
              color: '#0052FF',
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': {
                color: '#3B82F6',
                textDecoration: 'underline',
              },
            },
            h1: {
              fontSize: '2.5rem',
              fontWeight: '700',
              marginTop: '0',
              marginBottom: '1.5rem',
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #E5E7EB 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            },
            h2: {
              fontSize: '2rem',
              fontWeight: '600',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              color: '#F3F4F6',
              borderBottom: '2px solid #0052FF',
              paddingBottom: '0.5rem',
            },
            h3: {
              fontSize: '1.5rem',
              fontWeight: '600',
              marginTop: '2rem',
              marginBottom: '0.75rem',
              color: '#F9FAFB',
            },
            h4: {
              color: '#F9FAFB',
            },
            h5: {
              color: '#F9FAFB',
            },
            h6: {
              color: '#F9FAFB',
            },
            p: {
              color: '#D1D5DB',
              lineHeight: '1.8',
            },
            strong: {
              color: '#F9FAFB',
              fontWeight: '600',
            },
            code: {
              backgroundColor: '#1B263B',
              color: '#06B6D4',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              fontWeight: '500',
              border: '1px solid #0052FF40',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
              borderRadius: '0',
              fontSize: '0.875rem',
              lineHeight: '1.7',
              color: '#E5E7EB',
              border: 'none',
            },
            pre: {
              backgroundColor: '#0D1B2A',
              color: '#E5E7EB',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              overflowX: 'auto',
              lineHeight: '1.7',
              border: '1px solid #0052FF30',
              boxShadow: '0 4px 6px -1px rgba(0, 82, 255, 0.1), 0 2px 4px -1px rgba(0, 82, 255, 0.06)',
            },
            ul: {
              color: '#D1D5DB',
            },
            ol: {
              color: '#D1D5DB',
            },
            li: {
              color: '#D1D5DB',
              '&::marker': {
                color: '#0052FF',
              },
            },
            blockquote: {
              color: '#9CA3AF',
              borderLeftColor: '#0052FF',
              borderLeftWidth: '4px',
              fontStyle: 'italic',
              backgroundColor: '#0A1F44',
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
