const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const customPath = path.join(__dirname, './customPublicPath');

const browser = process.env.TEMP_BROWSER;

module.exports = {
  entry: {
    mainapp: [customPath, path.join(__dirname, '../browser/extension/mainapp')],
    background: [customPath, path.join(__dirname, '../browser/extension/background')],
    inject: [customPath, path.join(__dirname, '../browser/extension/inject')],
    contentScript: [path.join(__dirname, '../browser/extension/contentScript')],
  },
  output: {
    path: path.join(__dirname, `../build/${browser}/js`),
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js',
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.IgnorePlugin(/[^/]+\/[\S]+.dev$/),
    new ExtractTextPlugin({
      filename: '[name].[contenthash].css',
    }),
    new UglifyJSPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
        BROWSER: JSON.stringify(browser),
      },
    }),
  ],
  resolve: {
    extensions: ['*', '.js'],
  },
  node: {
    fs: 'empty',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['react-optimize'],
        },
      },
      {
        test: /\.(png|jpg|gif|svg|ttf|eot|woff2?)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {
            loader: 'file-loader',
            options: {},
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [autoprefixer],
            },
          },
        ],
      },
    ],
  },
};
