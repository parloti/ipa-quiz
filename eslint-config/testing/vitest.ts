import plugin from '@vitest/eslint-plugin';
import { defineConfig } from 'eslint/config';

export const vitest = defineConfig(
  {
    settings: { vitest: { typecheck: true } },
  },
  {
    extends: [plugin.configs.all],
    files: ['**/*.spec.ts'],
    name: 'vitest/custom',
    rules: {
      'vitest/consistent-test-filename': [
        'error',
        {
          allTestPattern: '.*\\.spec\\.ts$',
          pattern: '.*\\.spec\\.ts$',
        },
      ],
      'vitest/expect-expect': [
        'error',
        {
          assertFunctionNames: ['expect', 'expectError'],
        },
      ],
      'vitest/no-hooks': 'off',
      'vitest/prefer-expect-assertions': 'off',
      'vitest/prefer-importing-vitest-globals': 'error',
      'vitest/require-mock-type-parameters': 'off',
    },
  },
);
