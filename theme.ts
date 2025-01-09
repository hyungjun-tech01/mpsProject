'use client';

import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';


const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(26 46 5)',
    },
    secondary: {
      main: 'rgb(132 204 22)',
    },
    error: {
      main: red.A200,
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