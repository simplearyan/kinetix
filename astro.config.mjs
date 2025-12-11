// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://aryan-sharma.github.io', 
  base: '/',
  integrations: [react(), tailwind(), mdx()]
});
