import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'n/prefer-global/process': ['off', 'never'],
  },
  stylistic: {
    indent: 2,
    quotes: 'single',
  },

  ignores: [
    '.nitro/**',
    '.output/**',
    'data/**',
  ],
})
