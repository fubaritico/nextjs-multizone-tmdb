import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import importPlugin from 'eslint-plugin-import'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default defineConfig([
  // Next.js presets (includes react, react-hooks, @next/next rules)
  ...nextVitals,
  ...nextTs,

  // Global ignores
  globalIgnores([
    '**/.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'coverage/**',
    '**/next-env.d.ts',
    'pnpm-lock.yaml',
    'commitlint.config.js',
  ]),

  // TypeScript strict + stylistic (type-checked)
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx,mts}'],
  })),
  ...tseslint.configs.stylisticTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx,mts}'],
  })),

  // Language options for type-checked rules
  {
    files: ['**/*.{ts,tsx,mts}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Plugins registration
  {
    plugins: {
      import: importPlugin,
    },
  },

  // Base rules
  {
    files: ['**/*.{ts,tsx,mts}'],
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true },
      ],
      '@typescript-eslint/no-unsafe-assignment': 'warn',

      // Console
      'no-console': ['error', { allow: ['error', 'warn'] }],

      // Import ordering
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            orderImportKind: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'sort-imports': [
        'error',
        {
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        },
      ],
      'import/prefer-default-export': 'off',
      'import/no-extraneous-dependencies': 'off',

      // React (already covered by next/core-web-vitals, just overrides)
      'react/react-in-jsx-scope': 'off',
      'react/jsx-props-no-spreading': 'off',
    },
  },

  // Test file relaxations
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },

  // Prettier (must be last)
  eslintPluginPrettierRecommended,
])
