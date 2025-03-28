import type { Linter } from 'eslint';

export const spec: Linter.Config = {
  name: '@typescript-eslint/spec/custom',
  rules: {
    // TODO: Testar regra
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/unbound-method': 'off',
  },
};
