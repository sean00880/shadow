module.exports = {
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'next/core-web-vitals',
    ],
    rules: {
      // Disable unused variables warnings
      '@typescript-eslint/no-unused-vars': 'off',
  
      // Disable other rules if necessary
      'react/no-unescaped-entities': 'off',
      'no-unused-vars': 'off',
    },
  };