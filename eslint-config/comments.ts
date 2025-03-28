import configs from '@eslint-community/eslint-plugin-eslint-comments/configs';
import { defineConfig } from 'eslint/config';

export const comments = defineConfig(configs.recommended, {
  name: '@eslint-community/eslint-comments/custom',
  rules: {
    '@eslint-community/eslint-comments/disable-enable-pair': 'off',
    '@eslint-community/eslint-comments/no-unused-disable': 'error',
    '@eslint-community/eslint-comments/require-description': 'error',
  },
});
