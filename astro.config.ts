import { defineConfig } from 'astro/config';

import expressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import spectre from './package/src';
import { spectreDark } from './src/ec-theme';
import vercel from '@astrojs/vercel';
import preact from '@astrojs/preact';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://ai77ee.vercel.app',
  output: 'static',
  integrations: [expressiveCode({
    themes: [spectreDark],
  }), mdx(), sitemap(), spectre({
    name: 'ai77ee',
    openGraph: {
      home: {
        title: 'ai77ee',
        description: 'ai77ee site talking about tech stuff and more.'
      },
      blog: {
        title: 'Blog',
        description: 'ai77ee blog.'
      },
      projects: {
        title: 'Projects'
      }
    },
    giscus: {
      repository: 'ai77ee/ai77ee-site',
      repositoryId: 'R_kgDONwflww',
      category: 'General',
      categoryId: 'DIC_kwDONwflw84CmZK7',
      mapping: 'pathname',
      strict: true,
      reactionsEnabled: true,
      emitMetadata: false,
      lang: 'en',
    }
  }), preact()],
 //adapter: vercel()
  adapter: node({ mode: 'standalone' }), 
});