'use client';

import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';


const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(26 46 5)',
      dark: 'rgb(13 23 3)',
    },
    secondary: {
      main: 'rgb(132 204 22)',
      dark: 'rgb(61 102 11)',
    },
    action: {
      hover: 'rgb(245 245 244)',
    },
    error: {
      main: red.A200,
      dark: red.A700,
    },
  },
  colorSchemes: { light: true, dark: true },
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  typography: {
    fontFamily: 'var(--font-roboto)',
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { severity: 'info' },
              style: {
                backgroundColor: '#9a55ff',
              },
            },
          ],
        },
      },
    },
  },
});

export default theme;