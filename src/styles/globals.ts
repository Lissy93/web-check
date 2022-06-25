import { createGlobalStyle } from 'styled-components';
import PTMono from 'assets/fonts/PTMono.ttf';

export const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: PTMono;
    font-style: normal;
    font-weight: 400;
    src: url(${PTMono});
  }
  body { font-family: PTMono; }
`;

export default GlobalStyles;
