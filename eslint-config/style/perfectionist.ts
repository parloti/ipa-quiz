import plugin from 'eslint-plugin-perfectionist';
import { defineConfig } from 'eslint/config';

export const perfectionist = defineConfig(
  plugin.configs['recommended-natural'],
);
