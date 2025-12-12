// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

import mdx from '@astrojs/mdx';

// Detect environment
const isGhPages = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  site: 'https://aryan-sharma.github.io', 
  // Vercel uses root '/', GitHub Pages uses '/kinetix'
  base: isGhPages ? '/kinetix' : '/',
  integrations: [react(), tailwind(), mdx()]
});
