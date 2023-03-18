export default {
  targets: "node 10.0",
  presets: [
    '@babel/preset-typescript',
    ['@babel/preset-env', { modules: false }],
  ],
  plugins: [
    ["@babel/plugin-transform-arrow-functions"], // FIXME work around Qt bug in arrow functions https://bugreports.qt.io/browse/QTBUG-95677
    ['@babel/plugin-transform-runtime', { corejs: 3, regenerator: false, absoluteRuntime: true }]
  ]
}
