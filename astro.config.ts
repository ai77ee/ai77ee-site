import { loadEnv } from "vite";
import { defineConfig } from 'astro/config';

import expressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import preact from '@astrojs/preact';
import node from '@astrojs/node';
import spectre from './package/src';
import { spectreDark } from './src/ec-theme';

const env = loadEnv(process.env.NODE_ENV!, process.cwd(), "PUBLIC_");


const {
  PUBLIC_GISCUS_REPO,
  PUBLIC_GISCUS_REPO_ID,
  PUBLIC_GISCUS_CATEGORY,
  PUBLIC_GISCUS_CATEGORY_ID,
  PUBLIC_GISCUS_MAPPING,
  PUBLIC_GISCUS_STRICT,
  PUBLIC_GISCUS_REACTIONS_ENABLED,
  PUBLIC_GISCUS_EMIT_METADATA,
  PUBLIC_GISCUS_LANG
} = env;
const IS_VERCEL_ENV = process.env.VERCEL === '1';
// https://astro.build/config
export default defineConfig({
  site: 'https://ai77ee.xyz',
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
      repository: PUBLIC_GISCUS_REPO!,
      repositoryId: PUBLIC_GISCUS_REPO_ID!,
      category: PUBLIC_GISCUS_CATEGORY!,
      categoryId: PUBLIC_GISCUS_CATEGORY_ID!,
      mapping: PUBLIC_GISCUS_MAPPING as "pathname",
      strict: PUBLIC_GISCUS_STRICT === "true",
      reactionsEnabled: PUBLIC_GISCUS_REACTIONS_ENABLED === "true",
      emitMetadata: PUBLIC_GISCUS_EMIT_METADATA === "true",
      lang: PUBLIC_GISCUS_LANG!,
    }
  }), preact()],

  adapter: process.env.VERCEL === '1'
    ? vercel({
      imageService: true,
      devImageService: 'squoosh',
    })
    : node({ mode: 'standalone' }),
});