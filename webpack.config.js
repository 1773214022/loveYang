const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    index: './src/index.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Output Management',
    }),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(json)$/i,
        type: 'asset/resource',
      },
      { test: /\.(frag|vert)$/, use: 'raw-loader' },
      { test: /\.(css)$/, use: ['style-loader', 'css-loader'] }
    ]
  }
};