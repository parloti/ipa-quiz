import type { ESLint, Linter } from 'eslint';
import plugin from 'eslint-plugin-jasmine';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

const recommendedRules = plugin.configs.recommended;

const configs = defineConfig(
  {
    ...recommendedRules,
    languageOptions: { globals: { ...globals.jasmine } },
    name: 'jasmine/recommended',
    plugins: {
      jasmine: plugin as ESLint.Plugin,
    },
  },
  {
    name: 'jasmine/custom',
    rules: {
      'jasmine/missing-expect': 'error',
      'jasmine/named-spy': 'error',
      'jasmine/no-assign-spyon': 'error',
      'jasmine/prefer-toBeUndefined': 'error',
    },
  },
);

export const jasmine: Linter.Config[] = configs.map(
  (config: Linter.Config) => ({
    ...config,
    files: ['**/*.browser.spec.ts'],
  }),
);
