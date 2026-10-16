import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const compilerRules = [
  'react-hooks/static-components',
  'react-hooks/use-memo',
  'react-hooks/preserve-manual-memoization',
  'react-hooks/immutability',
  'react-hooks/globals',
  'react-hooks/refs',
  'react-hooks/set-state-in-effect',
  'react-hooks/error-boundaries',
  'react-hooks/purity',
  'react-hooks/set-state-in-render',
  'react-hooks/config',
  'react-hooks/gating',
];

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'test-results/**', 'playwright-report/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs.flat.recommended,
  prettier,
  {
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'react/prop-types': 'off',
      ...Object.fromEntries(compilerRules.map((rule) => [rule, 'off'])),
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}', 'vite.config.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
);
