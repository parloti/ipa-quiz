import type { RulesConfig } from '@eslint/core';

import { defineConfig } from 'eslint/config';
import { configs } from 'typescript-eslint';

const { recommendedTypeChecked } = configs;
const off = [
  'no-magic-numbers',
  'no-type-alias',
  'sort-type-constituents',
  'naming-convention',
  'no-use-before-define',
  'member-ordering',
  'no-unsafe-type-assertion',
];

const customOff = off
  .map((rule) => `@typescript-eslint/${rule}`)
  .reduce<RulesConfig>((prev, curr) => ({ ...prev, [curr]: 'off' }), {});

export const typescript = defineConfig(
  recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname + '/../..',
      },
    },
  },
  {
    name: '@typescript-eslint/custom',
    rules: {
      // Keep day-to-day lint practical; architecture is enforced separately.
      '@typescript-eslint/class-methods-use-this': 'off',
      '@typescript-eslint/consistent-return': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/init-declarations': 'off',
      '@typescript-eslint/max-params': 'off',
      '@typescript-eslint/no-deprecated': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-invalid-void-type': 'off',
      '@typescript-eslint/no-loop-func': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unnecessary-type-conversion': 'off',
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/prefer-destructuring': 'off',
      '@typescript-eslint/prefer-for-of': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/unified-signatures': [
        'error',
        { ignoreDifferentlyNamedParameters: true },
      ],

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // These are often too strict/noisy for existing codebases.
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',

      ...customOff,
    },
  },
  {
    name: "@typescript-eslint/custom-TypeError: Cannot read properties of undefined (reading 'checkFlags')",
    rules: {
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    },
  },
  {
    files: ['**/*.spec.ts'],
    name: '@typescript-eslint/custom-spec',
    rules: {
      '@typescript-eslint/init-declarations': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
);
