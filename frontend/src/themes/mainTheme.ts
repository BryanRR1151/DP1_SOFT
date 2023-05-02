import { createTheme } from '@mui/material/styles'
import { PaletteColorOptions } from '@mui/material'
import colorConfigs from '../configs/colorConfigs';

const { palette } = createTheme();
const { augmentColor } = palette;

const createColor = (mainColor: any) => augmentColor({ color: { main: mainColor } });

declare module '@mui/material/styles' {
  interface CustomPalette {
    secondary: PaletteColorOptions;
  }
  interface Palette extends CustomPalette {}
  interface PaletteOptions extends CustomPalette {}
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    secondary: true;
  }
}

export const theme = createTheme({
  palette: {
    secondary: createColor(colorConfigs.secondary)
  },
});
