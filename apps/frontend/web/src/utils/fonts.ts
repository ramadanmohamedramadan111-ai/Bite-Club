import { Rubik, Readex_Pro } from 'next/font/google';

export const contentFont = Rubik({
  subsets: [
    'arabic',
    'cyrillic',
    'cyrillic-ext',
    'hebrew',
    'latin',
    'latin-ext',
  ],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  style: ['italic', 'normal'],
  variable: '--font-sans',
});

export const headFont = Readex_Pro({
  subsets: ['arabic', 'latin', 'latin-ext', 'vietnamese'],
  weight: ['400', '500', '600', '700', '200', '300'],
  style: ['normal'],
  variable: '--font-heading',
});

