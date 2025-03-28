import type { Linter } from 'eslint';

import plugin from 'eslint-plugin-jsdoc';
import { defineConfig } from 'eslint/config';

export const jsdoc = defineConfig(
  plugin.configs['flat/recommended-typescript-error'],
  plugin.configs['flat/contents-typescript-error'],
  plugin.configs['flat/logical-typescript-error'],
  plugin.configs['flat/requirements-typescript-error'] as Linter.Config,
  plugin.configs['flat/stylistic-typescript-error'],
  {
    name: 'jsdoc/custom',
    rules: {
      'jsdoc/check-indentation': 'error',
      'jsdoc/check-tag-names': [
        'error',
        { definedTags: ['inline'], typed: true },
      ],
      'jsdoc/convert-to-jsdoc-comments': 'error',
      'jsdoc/imports-as-dependencies': 'error',
      'jsdoc/lines-before-block': ['error', { excludedTags: ['inline'] }],
      'jsdoc/require-description': 'error',
      'jsdoc/require-description-complete-sentence': 'error',
      'jsdoc/require-example': 'off',
      'jsdoc/require-property-type': 'error',
      'jsdoc/require-template': 'error',
      'jsdoc/require-throws': 'error',
      'jsdoc/sort-tags': 'error',
    },
  },
);
