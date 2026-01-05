import type { ConfigObject, RulesConfig } from '@eslint/core';

import { flatConfigs, rules } from 'eslint-plugin-import-x';
import { defineConfig } from 'eslint/config';

const customIgnore = [
  'dynamic-import-chunkname',
  'no-default-export',
  'no-deprecated',
  'no-named-export',
  'no-namespace',
  'order',
  'prefer-default-export',
];

const warnings = Object.keys(flatConfigs.warnings.rules ?? {});
const recommended = Object.keys(flatConfigs.recommended.rules ?? {});
const typescript = Object.keys(flatConfigs.typescript.rules ?? {});

const allConfigs = [...warnings, ...recommended, ...typescript];

const _customError = Object.keys(rules)
  .filter((rule) => !customIgnore.includes(rule))
  .map((rule) => `import-x/${rule}`)
  .filter((rule) => !allConfigs.includes(rule))
  .reduce<RulesConfig>((prev, curr) => ({ ...prev, [curr]: 'error' }), {});

export const importX = defineConfig(
  flatConfigs.warnings as ConfigObject,
  flatConfigs.recommended as ConfigObject,
  flatConfigs.typescript as ConfigObject,
  {
    name: 'import-x/custom-typescript',
    rules: {
      'import-x/no-relative-parent-imports': 'off',
      'import-x/unambiguous': 'off',

      // Keep day-to-day linting practical.
      'import-x/no-cycle': 'off',
      'import-x/no-internal-modules': 'off',

      // These rules are very noisy in large TS projects.
      'import-x/group-exports': 'off',
      'import-x/max-dependencies': 'off',
    },
  },
  {
    ignores: ['*'],
    name: 'import-x/custom-root-config-files',
    rules: {
      'import-x/no-default-export': 'error',
    },
  },
);
