export default {
  presets: [
    '@babel/preset-typescript',
    ['@babel/preset-env', { modules: false }],
  ],
  plugins: [
    'transform-es3-member-expression-literals',
    'transform-es3-property-literals',
    '@babel/plugin-proposal-class-properties',
    ['@babel/plugin-transform-runtime', { corejs: 3, regenerator: false, absoluteRuntime: true }]
  ]
}
