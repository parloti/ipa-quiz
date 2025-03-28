declare module 'eslint-plugin-import' {
  import type { Linter } from 'eslint';

  const flatConfigs: {
    recommended: Linter.Config;
    errors: Linter.Config;
    warnings: Linter.Config;
    react: Linter.Config;
    'react-native': Linter.Config;
    electron: Linter.Config;
    typescript: Linter.Config;
  };

  export { flatConfigs };
}
