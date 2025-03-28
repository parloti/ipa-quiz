declare module 'eslint-plugin-jasmine' {
  import type { RuleDefinition } from '@eslint/core';

  const plugin: {
    rules: {
      'expect-matcher': RuleDefinition;
      'expect-single-argument': RuleDefinition;
      'named-spy': RuleDefinition;
      'no-focused-tests': RuleDefinition;
      'no-disabled-tests': RuleDefinition;
      'no-describe-variables': RuleDefinition;
      'no-suite-dupes': RuleDefinition;
      'no-spec-dupes': RuleDefinition;
      'missing-expect': RuleDefinition;
      'no-suite-callback-args': RuleDefinition;
      'valid-expect': RuleDefinition;
      'no-assign-spyon': RuleDefinition;
      'no-unsafe-spy': RuleDefinition;
      'no-global-setup': RuleDefinition;
      'no-pending-tests': RuleDefinition;
      'no-promise-without-done-fail': RuleDefinition;
      'no-expect-in-setup-teardown': RuleDefinition;
      'new-line-between-declarations': RuleDefinition;
      'new-line-before-expect': RuleDefinition;
      'prefer-jasmine-matcher': RuleDefinition;
      'prefer-promise-strategies': RuleDefinition;
      'prefer-toHaveBeenCalledWith': RuleDefinition;
      'prefer-toBeUndefined': RuleDefinition;
    };
    configs: {
      recommended: {
        rules: {
          'jasmine/expect-matcher': 1;
          'jasmine/expect-single-argument': 1;
          'jasmine/named-spy': 0;
          'jasmine/no-focused-tests': 2;
          'jasmine/no-disabled-tests': 1;
          'jasmine/no-describe-variables': 0;
          'jasmine/no-suite-dupes': 1;
          'jasmine/no-spec-dupes': 1;
          'jasmine/missing-expect': 0;
          'jasmine/no-suite-callback-args': 2;
          'jasmine/no-assign-spyon': 0;
          'jasmine/no-unsafe-spy': 1;
          'jasmine/no-global-setup': 2;
          'jasmine/no-pending-tests': 1;
          'jasmine/no-promise-without-done-fail': 1;
          'jasmine/no-expect-in-setup-teardown': 1;
          'jasmine/new-line-between-declarations': 1;
          'jasmine/new-line-before-expect': 1;
          'jasmine/prefer-jasmine-matcher': 1;
          'jasmine/prefer-promise-strategies': 1;
          'jasmine/prefer-toHaveBeenCalledWith': 1;
          'jasmine/prefer-toBeUndefined': 0;
        };
      };
    };
  };

  export = plugin;
}
