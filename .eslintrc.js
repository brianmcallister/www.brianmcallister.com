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
    // 'import/prefer-default-export': 0,
    // 'import/no-default-export': 2,
    // '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    // '@typescript-eslint/ban-ts-ignore': 0,
    // 'jsx-a11y/label-has-associated-control': 0,
    // 'jsx-a11y/no-noninteractive-element-interactions': 0,
    // 'jsx-a11y/mouse-events-have-key-events': 0,
    // 'jsx-a11y/no-static-element-interactions': 0,
    // 'react/no-did-update-set-state': 0,
  },
}
