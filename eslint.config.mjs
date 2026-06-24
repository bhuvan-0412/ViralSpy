import nextConfig from 'eslint-config-next/core-web-vitals'
import eslintPluginSecurity from 'eslint-plugin-security'
import eslintConfigPrettier from 'eslint-config-prettier'

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...nextConfig,
  eslintPluginSecurity.configs.recommended,
  {
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  eslintConfigPrettier,
]

export default eslintConfig
