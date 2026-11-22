import { defineConfig } from 'vite';

// base './' — сайт работает и с GitHub Pages (подпапка cv-belgazprombank/),
// и при открытии dist/index.html локально с диска.
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
  },
});
