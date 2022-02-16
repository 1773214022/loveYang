const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    index: './src/index.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Output Management',
    }),
    new CopyWebpackPlugin({patterns: [{
      from:path.resolve(__dirname, 'src/static'),
        to: 'static'
    }]}),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'docs'),
  },
  module: {
    rules: [
      { test: /\.(frag|vert)$/, use: 'raw-loader' },
      { test: /\.(css)$/, use: ['style-loader', 'css-loader'] }
    ]
  }
};