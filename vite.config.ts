import { defineConfig } from 'vite';

// For a user site (0krk0.github.io) the base is '/'.
// If you deploy to a project repo instead (0krk0.github.io/portfolio), set BASE=/portfolio/.
export default defineConfig({
  base: process.env.BASE ?? '/',
  build: { target: 'es2020', cssMinify: true, assetsInlineLimit: 0 },
});
