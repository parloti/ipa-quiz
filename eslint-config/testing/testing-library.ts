import plugin from 'eslint-plugin-testing-library';
import { defineConfig } from 'eslint/config';

export const testingLibrary = defineConfig(plugin.configs['flat/angular'], {
  files: ['**/*.spec.ts'],
  name: 'testing-library/custom',
  rules: {
    'testing-library/consistent-data-testid': [
      'error',
      {
        testIdAttribute: ['data-testid', 'testId'],
        testIdPattern: '^[A-Z]*$',
      },
    ],
    'testing-library/no-node-access': 'error',
    'testing-library/prefer-explicit-assert': 'error',
    'testing-library/prefer-query-matchers': 'error',
    'testing-library/prefer-user-event': 'error',
  },
});
