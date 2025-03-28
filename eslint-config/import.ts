import { flatConfigs } from 'eslint-plugin-import';
import { defineConfig } from 'eslint/config';

export const importPlugin = defineConfig(
  flatConfigs.recommended,
  flatConfigs.typescript,
  {
    name: 'import/custom',
    rules: {
      'import/no-unresolved': 'off',
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
);
