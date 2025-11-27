import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#E6F2F5',
      100: '#C0DEE6',
      200: '#99CAD7',
      300: '#73B6C8',
      400: '#4DA2B9',
      500: '#268EAA', // Primary - Deep Ocean Blue
      600: '#1E7288',
      700: '#175666',
      800: '#0F3A44',
      900: '#081E22',
    },
    lake: {
      50: '#EBF4F6',
      100: '#C8E1E7',
      200: '#A5CED8',
      300: '#82BBC9',
      400: '#5FA8BA',
      500: '#3C95AB', // Lake Blue
      600: '#307789',
      700: '#245967',
      800: '#183B45',
      900: '#0C1E23',
    },
    earth: {
      50: '#F5F2ED',
      100: '#E5DBCD',
      200: '#D5C4AD',
      300: '#C5AD8D',
      400: '#B5966D',
      500: '#A57F4D', // Earthy Brown
      600: '#84663E',
      700: '#634C2E',
      800: '#42331F',
      900: '#21190F',
    },
    danger: {
      50: '#FFE5E5',
      100: '#FFB8B8',
      200: '#FF8A8A',
      300: '#FF5C5C',
      400: '#FF2E2E',
      500: '#FF0000', // Alert Red
      600: '#CC0000',
      700: '#990000',
      800: '#660000',
      900: '#330000',
    },
    success: {
      50: '#E6F9F0',
      100: '#B8EDD5',
      200: '#8AE1BA',
      300: '#5CD59F',
      400: '#2EC984',
      500: '#00BD69', // Success Green
      600: '#009754',
      700: '#00713F',
      800: '#004C2A',
      900: '#002615',
    },
  },
  fonts: {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'lg',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          _active: {
            bg: 'brand.700',
            transform: 'translateY(0)',
          },
          transition: 'all 0.2s',
        },
        ghost: {
          _hover: {
            bg: 'brand.50',
          },
        },
      },
      defaultProps: {
        variant: 'solid',
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          boxShadow: 'sm',
          bg: 'white',
          overflow: 'hidden',
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderRadius: 'lg',
            borderColor: 'gray.300',
            _hover: {
              borderColor: 'brand.400',
            },
            _focus: {
              borderColor: 'brand.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
            },
          },
        },
      },
      defaultProps: {
        variant: 'outline',
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: 'xl',
        },
      },
    },
    Stat: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          p: 4,
          bg: 'white',
        },
      },
    },
  },
})

export default theme
