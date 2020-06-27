module.exports = {
  plugins: [
    '@typescript-eslint',
    'eslint-comments',
    'promise',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: [
    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:eslint-comments/recommended',
    'plugin:promise/recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
  ],
  env: {
    browser: true,
  },
  rules: {
    'import/prefer-default-export': 0,
    'import/no-default-export': 2,
  },
  overrides: [
    {
      files: ['src/pages/*.tsx', 'src/pages/api/*.ts'],
      rules: {
        'import/prefer-default-export': 2,
        'import/no-default-export': 0,
      }
    }
  ]
}
