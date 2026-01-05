import type { RulesConfig } from '@eslint/core';

import index from 'eslint-plugin-jsdoc';
import { defineConfig } from 'eslint/config';

const { configs } = index;

const customError = [
  'check-indentation',
  'convert-to-jsdoc-comments',
  'require-description',
  'require-description-complete-sentence',
  'require-template',
  'require-template-description',
  'require-throws',
  'require-throws-description',
  'sort-tags',
].reduce<RulesConfig>(
  (prev, curr) => ({ ...prev, [`jsdoc/${curr}`]: 'error' }),
  {},
);

export const jsdoc = defineConfig(
  configs['flat/recommended-typescript-error'],
  configs['flat/contents-typescript-error'],
  configs['flat/logical-typescript-error'],
  configs['flat/requirements-typescript-error'],
  configs['flat/stylistic-typescript-error'],
  {
    name: 'jsdoc/custom',
    rules: {
      ...customError,
      'jsdoc/text-escaping': 'off',
    },
  },
  {
    files: ['**/*.spec.ts'],
    name: 'jsdoc/custom-spec',
    rules: {
      'jsdoc/convert-to-jsdoc-comments': [
        'error',
        { allowedPrefixes: ['Arrange', 'Act'] },
      ],
    },
  },
);
