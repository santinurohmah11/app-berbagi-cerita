const common = require('./webpack.common.js');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = merge(common, {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        ],
      },
    ],
  },
  plugins: [
  new MiniCssExtractPlugin({
    filename: '[name].css',
  }),
  new CopyWebpackPlugin({
    patterns: [
      { from: path.resolve(__dirname, 'src/manifest.json'), to: path.resolve(__dirname, 'dist/') },
      { from: path.resolve(__dirname, 'src/service-worker.js'), to: path.resolve(__dirname, 'dist/') },
      { from: path.resolve(__dirname, 'src/public/images'), to: path.resolve(__dirname, 'dist/images') },
    ],
  }),
],

});
