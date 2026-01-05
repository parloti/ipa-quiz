import plugin from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';

export const stylistic = defineConfig(plugin.configs.all);
