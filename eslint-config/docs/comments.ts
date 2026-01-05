import type { RulesConfig } from '@eslint/core';

import eslintCommentsPlugin from '@eslint-community/eslint-plugin-eslint-comments';
import configs from '@eslint-community/eslint-plugin-eslint-comments/configs';
import { defineConfig } from 'eslint/config';

const { rules } = eslintCommentsPlugin;

const customIgnore = ['no-use'];
const recommended = Object.keys(configs.recommended.rules ?? {});

const customError = Object.keys(rules)
  .filter((rule) => !customIgnore.includes(rule))
  .map((rule) => `@eslint-community/eslint-comments/${rule}`)
  .filter((rule) => !recommended.includes(rule))
  .reduce<RulesConfig>((prev, curr) => ({ ...prev, [curr]: 'error' }), {});

export const comments = defineConfig(configs.recommended, {
  name: '@eslint-community/eslint-comments/custom',
  rules: {
    ...customError,
    '@eslint-community/eslint-comments/disable-enable-pair': 'off',
  },
});
