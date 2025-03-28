declare module '@eslint-community/eslint-plugin-eslint-comments/configs' {
  import type { ESLint } from 'eslint';

  const configs: {
    recommended: {
      name: '@eslint-community/eslint-comments/recommended';
      plugins: {
        '@eslint-community/eslint-comments': ESLint.Plugin;
      };
      rules: {
        '@eslint-community/eslint-comments/disable-enable-pair': 'error';
        '@eslint-community/eslint-comments/no-aggregating-enable': 'error';
        '@eslint-community/eslint-comments/no-duplicate-disable': 'error';
        '@eslint-community/eslint-comments/no-unlimited-disable': 'error';
        '@eslint-community/eslint-comments/no-unused-enable': 'error';
      };
    };
  };

  export = configs;
}
