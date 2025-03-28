import plugin from 'eslint-plugin-perfectionist';
import { defineConfig } from 'eslint/config';

export const perfectionist = defineConfig(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO: TEstar regra
  plugin.configs['recommended-natural'],
);
