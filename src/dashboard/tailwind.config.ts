import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../docs-new/content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Docs-specific colors
        docs: {
          bg: 'var(--docs-bg)',
          surface: 'var(--docs-surface)',
          border: 'var(--docs-border)',
          text: {
            primary: 'var(--docs-text-primary)',
            secondary: 'var(--docs-text-secondary)',
            tertiary: 'var(--docs-text-tertiary)',
          },
          code: {
            bg: 'var(--docs-code-bg)',
            text: 'var(--docs-code-text)',
            border: 'var(--docs-code-border)',
          },
        },
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.slate.700'),
            '--tw-prose-headings': theme('colors.slate.900'),
            '--tw-prose-links': theme('colors.blue.600'),
            '--tw-prose-bold': theme('colors.slate.900'),
            '--tw-prose-code': theme('colors.slate.900'),
            '--tw-prose-pre-bg': theme('colors.slate.50'),
            '--tw-prose-pre-code': theme('colors.slate.800'),
            maxWidth: '65ch',
            fontSize: '1rem',
            lineHeight: '1.75',

            // Headings
            h1: {
              fontSize: '2.25rem',
              fontWeight: '700',
              lineHeight: '1.2',
              marginTop: '0',
              marginBottom: '1.5rem',
            },
            h2: {
              fontSize: '1.875rem',
              fontWeight: '600',
              lineHeight: '1.3',
              marginTop: '3rem',
              marginBottom: '1rem',
            },
            h3: {
              fontSize: '1.5rem',
              fontWeight: '600',
              lineHeight: '1.4',
              marginTop: '2rem',
              marginBottom: '0.75rem',
            },
            h4: {
              fontSize: '1.25rem',
              fontWeight: '600',
              lineHeight: '1.5',
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
            },

            // Paragraphs
            p: {
              marginTop: '1rem',
              marginBottom: '1rem',
            },

            // Code
            code: {
              backgroundColor: theme('colors.slate.100'),
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '500',
              fontSize: '0.875em',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: theme('colors.slate.900'),
              color: theme('colors.slate.100'),
              padding: '1.5rem',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              lineHeight: '1.6',
              overflowX: 'auto',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
              color: 'inherit',
              fontSize: 'inherit',
            },

            // Links
            a: {
              color: theme('colors.blue.600'),
              textDecoration: 'underline',
              textDecorationColor: theme('colors.blue.200'),
              textUnderlineOffset: '2px',
              fontWeight: '500',
              transition: 'all 0.15s ease',
              '&:hover': {
                color: theme('colors.blue.700'),
                textDecorationColor: theme('colors.blue.600'),
              },
            },

            // Lists
            ul: {
              listStyleType: 'disc',
              paddingLeft: '1.5rem',
            },
            ol: {
              listStyleType: 'decimal',
              paddingLeft: '1.5rem',
            },
            li: {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },

            // Tables
            table: {
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: '0',
              fontSize: '0.875rem',
            },
            thead: {
              borderBottomWidth: '2px',
              borderBottomColor: theme('colors.slate.200'),
            },
            th: {
              padding: '0.75rem 1rem',
              textAlign: 'left',
              fontWeight: '600',
              color: theme('colors.slate.900'),
            },
            td: {
              padding: '0.75rem 1rem',
              borderTopWidth: '1px',
              borderTopColor: theme('colors.slate.100'),
            },

            // Blockquotes
            blockquote: {
              fontStyle: 'normal',
              borderLeftWidth: '4px',
              borderLeftColor: theme('colors.blue.500'),
              paddingLeft: '1.5rem',
              color: theme('colors.slate.700'),
              backgroundColor: theme('colors.blue.50'),
              padding: '1rem 1.5rem',
              borderRadius: '0.5rem',
              marginLeft: '0',
              marginRight: '0',
            },

            // Horizontal rule
            hr: {
              borderColor: theme('colors.slate.200'),
              marginTop: '2rem',
              marginBottom: '2rem',
            },
          },
        },
        // Dark mode
        dark: {
          css: {
            '--tw-prose-body': theme('colors.slate.300'),
            '--tw-prose-headings': theme('colors.slate.100'),
            '--tw-prose-links': theme('colors.blue.400'),
            '--tw-prose-bold': theme('colors.slate.100'),
            '--tw-prose-code': theme('colors.slate.100'),
            '--tw-prose-pre-bg': theme('colors.slate.800'),
            '--tw-prose-pre-code': theme('colors.slate.200'),

            code: {
              backgroundColor: theme('colors.slate.800'),
            },
            pre: {
              backgroundColor: theme('colors.slate.900'),
            },
            th: {
              color: theme('colors.slate.100'),
            },
            td: {
              borderTopColor: theme('colors.slate.700'),
            },
            blockquote: {
              backgroundColor: theme('colors.slate.800/50'),
              borderLeftColor: theme('colors.blue.500'),
              color: theme('colors.slate.300'),
            },
            hr: {
              borderColor: theme('colors.slate.700'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
  darkMode: 'class',
};

export default config;
