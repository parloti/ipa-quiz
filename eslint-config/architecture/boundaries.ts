import type { ConfigObject } from '@eslint/core';
import type {
  DependencyNodeSelector,
  Rules,
  Settings,
} from 'eslint-plugin-boundaries';

import { createConfig, strict } from 'eslint-plugin-boundaries/config';
import { defineConfig } from 'eslint/config';

const vitestNodes: DependencyNodeSelector = {
  kind: 'value',
  selector:
    'CallExpression[callee.object.name=vi][callee.property.name=/^(mock|unmock|doMock|doUnmock|importActual|importMock)$/] > Literal:first-child',
};

type AppElementType =
  | 'app-configs'
  | 'app-domain'
  | 'app-models'
  | 'app-state'
  | 'app-core'
  | 'app-infrastructure'
  | 'app-shared'
  | 'app-pages'
  | 'app-preferences'
  | 'app-root'
  | 'app-testing'
  | 'app-environments'
  | 'app-types'
  | 'app-utils'
  | 'app-entry';

const settings: Settings = {
  ...strict.settings,
  'boundaries/additional-dependency-nodes': [vitestNodes],
  'boundaries/dependency-nodes': [
    'dynamic-import',
    'export',
    'import',
    'require',
  ],
  'boundaries/elements': [
    { type: 'app-configs', pattern: 'src/app/configs/**' },
    { type: 'app-domain', pattern: 'src/app/domain/**' },
    { type: 'app-models', pattern: 'src/app/models/**' },
    { type: 'app-state', pattern: 'src/app/state/**' },
    { type: 'app-core', pattern: 'src/app/core/**' },
    { type: 'app-infrastructure', pattern: 'src/app/infrastructure/**' },
    { type: 'app-shared', pattern: 'src/app/shared/**' },
    { type: 'app-pages', pattern: 'src/app/pages/**' },
    { type: 'app-preferences', pattern: 'src/app/preferences/**' },
    { type: 'app-root', pattern: 'src/app/root/**' },
    { type: 'app-testing', pattern: 'src/app/testing/**' },
    { type: 'app-environments', pattern: 'src/environments/**' },
    { type: 'app-types', pattern: 'src/types/**' },
    { type: 'app-utils', pattern: 'src/utils/**' },
    { type: 'app-entry', pattern: 'src/main.ts' },
    { type: 'app-entry', pattern: 'src/test-setup.ts' },
    { type: 'app-entry', pattern: 'src/web-socket-server.ts' },
    { type: 'app-entry', pattern: 'src/**' },
  ] satisfies Array<{ type: AppElementType; pattern: string }>,
};

const rules: Rules = {
  ...strict.rules,
  'boundaries/element-types': [
    'error',
    {
      default: 'disallow',
      rules: [
        // Lowest layers
        {
          from: ['app-configs'],
          allow: ['app-configs', 'app-models'],
        },
        {
          from: ['app-domain'],
          allow: ['app-domain', 'app-configs', 'app-models'],
        },
        {
          from: ['app-models'],
          allow: ['app-models', 'app-domain', 'app-configs'],
        },

        // Application layer (NgRx / use-cases)
        {
          from: ['app-state'],
          allow: [
            'app-state',
            'app-models',
            'app-domain',
            'app-configs',
            'app-core',
          ],
        },

        // Platform / shared runtime services (ideally no dependency on state/pages)
        {
          from: ['app-core'],
          allow: ['app-core', 'app-models', 'app-domain', 'app-configs'],
        },

        // Adapters / side effects
        {
          from: ['app-infrastructure'],
          allow: [
            'app-infrastructure',
            'app-core',
            'app-models',
            'app-domain',
            'app-configs',
          ],
        },

        // Presentation layer
        {
          from: ['app-shared'],
          allow: ['app-shared', 'app-models', 'app-domain', 'app-configs'],
        },
        {
          from: ['app-pages', 'app-preferences'],
          allow: [
            'app-pages',
            'app-preferences',
            'app-shared',
            'app-state',
            'app-models',
            'app-domain',
            'app-configs',
          ],
        },
        {
          from: ['app-root'],
          allow: [
            'app-root',
            'app-pages',
            'app-preferences',
            'app-shared',
            'app-state',
            'app-core',
            'app-infrastructure',
            'app-models',
            'app-domain',
            'app-configs',
          ],
        },

        // Tests can reach everywhere.
        {
          from: ['app-testing'],
          allow: [
            'app-testing',
            'app-root',
            'app-pages',
            'app-preferences',
            'app-shared',
            'app-state',
            'app-core',
            'app-infrastructure',
            'app-models',
            'app-domain',
            'app-configs',
          ],
        },

        // Entry points can reach everything
        {
          from: ['app-entry'],
          allow: [
            'app-root',
            'app-pages',
            'app-preferences',
            'app-shared',
            'app-state',
            'app-core',
            'app-infrastructure',
            'app-models',
            'app-domain',
            'app-configs',
            'app-environments',
            'app-types',
            'app-utils',
          ],
        },

        // Environments, types, and utils are foundational
        {
          from: ['app-environments'],
          allow: ['app-environments'],
        },
        {
          from: ['app-types'],
          allow: ['app-types'],
        },
        {
          from: ['app-utils'],
          allow: ['app-utils', 'app-types'],
        },
      ],
    },
  ],
};

const config = createConfig({
  name: 'boundaries/custom',
  files: ['**/src/app/**/*.ts'],
  ignores: ['**/*.spec.ts', '!**/src/app/**'],
  rules,
  settings,
}) as ConfigObject;

export const boundaries = defineConfig(config, {
  files: ['**/src/app/**/*.ts'],
  ignores: ['**/*.spec.ts', '!**/src/app/**'],
  name: 'boundaries/custom',
  rules: {
    'boundaries/element-types': 'off',
    'boundaries/no-unknown-files': 'off',
  },
});
