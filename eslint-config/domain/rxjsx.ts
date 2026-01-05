import type { ConfigObject } from '@eslint/core';

import rxjsX from 'eslint-plugin-rxjs-x';
import { defineConfig } from 'eslint/config';

export const rxjs = defineConfig(
  rxjsX.configs.strict as ConfigObject,
  {
    name: 'rxjs-x/custom',
    rules: {
      'rxjs-x/no-ignored-default-value': 'off',
      'rxjs-x/no-subclass': 'off',
      'rxjs-x/no-unbound-methods': 'off',
    },
  },
  {
    files: ['**/*.spec.ts'],
    name: 'rxjs-x/custom-spec',
    rules: {
      'rxjs-x/no-ignored-error': 'off',
    },
  },
);
