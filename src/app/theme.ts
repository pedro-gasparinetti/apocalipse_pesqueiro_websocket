'use client'

import * as Chakra from '@chakra-ui/react'
import { mode, type StyleFunctionProps } from '@chakra-ui/theme-tools'

const config: Chakra.ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
}

const theme = Chakra.extendTheme({
  config,
  fonts: {
    heading: "'Inter', 'SF Pro Text', system-ui, -apple-system, sans-serif",
    body: "'Inter', 'SF Pro Text', system-ui, -apple-system, sans-serif",
  },
  radii: { sm: '6px', md: '10px', lg: '14px', xl: '18px', '2xl': '24px', pill: '999px' },
  shadows: {
    hairline: '0 1px 0 rgba(12, 18, 31, 0.08)',
    soft: '0 12px 30px rgba(12, 18, 31, 0.14)',
    float: '0 24px 60px rgba(12, 18, 31, 0.18)',
  },
  colors: {
    accent: {
      50: '#E9F1FF',
      100: '#C9DDFF',
      200: '#A9C9FF',
      300: '#89B5FF',
      400: '#6BA7F5',
      500: '#5B8DEF',
      600: '#3D7FDB',
      700: '#2F68B3',
      800: '#214C82',
      900: '#163355',
    },
    brand: {
      50: '#E9F1FF',
      100: '#C9DDFF',
      200: '#A9C9FF',
      300: '#89B5FF',
      400: '#6BA7F5',
      500: '#5B8DEF',
      600: '#3D7FDB',
      700: '#2F68B3',
      800: '#214C82',
      900: '#163355',
    },
    lake: {
      50: '#EBF4F6',
      100: '#C8E1E7',
      200: '#A5CED8',
      300: '#82BBC9',
      400: '#5FA8BA',
      500: '#3C95AB',
      600: '#307789',
      700: '#245967',
      800: '#183B45',
      900: '#0C1E23',
    },
    ink: { 50: '#F7F8FB', 100: '#E8EAF1', 200: '#C7CBD6', 300: '#A4AABB', 500: '#6C7386', 700: '#2A3042', 800: '#151A26', 900: '#0C1018' },
    paper: { 50: '#FFFFFF', 100: '#F7F8FB', 200: '#EEF0F5', 800: '#111520', 900: '#0C1018' },
    success: {
      50: '#E6F9F0',
      100: '#B8EDD5',
      200: '#8AE1BA',
      300: '#5CD59F',
      400: '#2EC984',
      500: '#3BAA7A',
      600: '#009754',
      700: '#00713F',
      800: '#004C2A',
      900: '#002615',
    },
    danger: {
      50: '#FFE5E5',
      100: '#FFB8B8',
      200: '#FF8A8A',
      300: '#FF5C5C',
      400: '#FF2E2E',
      500: '#E15D5D',
      600: '#C84B4B',
      700: '#990000',
      800: '#660000',
      900: '#330000',
    },
    warning: {
      50: '#FFF7E0',
      100: '#FDE7A6',
      200: '#F6D574',
      300: '#F0C244',
      400: '#EAB22A',
      500: '#E0A52E',
      600: '#C58A1C',
      700: '#9B6812',
      800: '#6A450B',
      900: '#412706',
    },
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: mode('#F7F8FB', '#0C1018')(props),
        color: mode('#0F172A', '#E6E9F2')(props),
        fontWeight: 500,
        letterSpacing: '-0.01em',
        transition: 'background-color 0.2s ease, color 0.2s ease',
      },
      '.glass-panel': {
        backdropFilter: 'blur(18px)',
        background: mode('rgba(255,255,255,0.7)', 'rgba(18,22,31,0.75)')(props),
        border: '1px solid',
        borderColor: mode('rgba(12,18,31,0.08)', 'rgba(255,255,255,0.12)')(props),
        boxShadow: '0 16px 40px rgba(12, 18, 31, 0.12)',
      },
      '::selection': {
        background: 'rgba(91, 141, 239, 0.25)',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'pill',
        fontWeight: 600,
        transition: 'all 0.18s ease',
      },
      variants: {
        primary: (props: StyleFunctionProps) => ({
          bg: mode('accent.500', 'accent.400')(props),
          color: 'white',
          boxShadow: 'soft',
          _hover: { bg: mode('accent.600', 'accent.300')(props), transform: 'translateY(-1px)', boxShadow: 'float' },
          _active: { transform: 'translateY(0)', boxShadow: 'soft' },
          _disabled: { opacity: 0.5, cursor: 'not-allowed' },
        }),
        secondary: (props: StyleFunctionProps) => ({
          bg: 'transparent',
          color: mode('ink.700', 'paper.100')(props),
          border: '1px solid',
          borderColor: mode('rgba(12,18,31,0.14)', 'rgba(255,255,255,0.18)')(props),
          _hover: { bg: mode('rgba(91,141,239,0.06)', 'rgba(255,255,255,0.06)')(props), transform: 'translateY(-1px)' },
          _active: { transform: 'translateY(0)' },
        }),
        ghost: (props: StyleFunctionProps) => ({
          bg: 'transparent',
          color: mode('ink.700', 'paper.100')(props),
          _hover: { bg: mode('rgba(91,141,239,0.08)', 'rgba(255,255,255,0.08)')(props), transform: 'translateY(-1px)' },
          _active: { transform: 'translateY(0)' },
        }),
        destructive: {
          bg: 'danger.500',
          color: 'white',
          _hover: { bg: '#C84B4B', transform: 'translateY(-1px)' },
          _active: { transform: 'translateY(0)' },
        },
      },
      defaultProps: { variant: 'primary' },
    },
    Card: {
      baseStyle: (props: StyleFunctionProps) => ({
        container: {
          bg: mode('paper.50', 'paper.900')(props),
          border: '1px solid',
          borderColor: mode('rgba(12,18,31,0.12)', 'rgba(255,255,255,0.12)')(props),
          borderRadius: 'xl',
          boxShadow: 'float',
        },
      }),
    },
    Input: {
      variants: {
        outline: (props: StyleFunctionProps) => ({
          field: {
            borderRadius: 'lg',
            bg: mode('paper.50', 'paper.900')(props),
            borderColor: mode('rgba(12,18,31,0.12)', 'rgba(255,255,255,0.18)')(props),
            _hover: { borderColor: 'accent.400' },
            _focus: { borderColor: 'accent.500', boxShadow: '0 0 0 1px var(--chakra-colors-accent-500)' },
          },
        }),
      },
      defaultProps: { variant: 'outline' },
    },
    Tabs: {
      baseStyle: (props: StyleFunctionProps) => ({
        tab: {
          fontWeight: 600,
          borderRadius: 'pill',
          _selected: {
            bg: mode('accent.50', 'rgba(91,141,239,0.16)')(props),
            color: mode('ink.800', 'paper.50')(props),
            boxShadow: 'inset 0 0 0 1px rgba(91,141,239,0.35)',
          },
        },
        tablist: {
          gap: 2,
          borderBottom: '1px solid',
          borderColor: mode('rgba(12,18,31,0.08)', 'rgba(255,255,255,0.08)')(props),
        },
        tabpanel: { padding: 0 },
      }),
    },
    Divider: {
      baseStyle: (props: StyleFunctionProps) => ({
        borderColor: mode('rgba(12,18,31,0.08)', 'rgba(255,255,255,0.12)')(props),
      }),
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: '2xl',
          boxShadow: 'float',
          backdropFilter: 'blur(16px)',
        },
      },
    },
  },
})

export default theme
