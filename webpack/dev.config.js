const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

const host = 'localhost';
const port = 3000;
const customPath = path.join(__dirname, './customPublicPath');
const hotScript = 'webpack-hot-middleware/client?path=__webpack_hmr&dynamicPublicPath=true';

const args = process.argv.slice(2);
const browser = args.indexOf('--firefox') !== -1 ? 'firefox' : 'chrome';

const baseDevConfig = () => ({
  devtool: 'eval-cheap-module-source-map',
  entry: {
    mainapp: [customPath, hotScript, path.join(__dirname, '../browser/extension/mainapp')],
    background: [customPath, hotScript, path.join(__dirname, '../browser/extension/background')],
    contentScript: [customPath, path.join(__dirname, '../browser/extension/contentScript.js')],
  },
  devMiddleware: {
    publicPath: `http://${host}:${port}/js`,
    stats: {
      colors: true,
    },
    noInfo: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  hotMiddleware: {
    path: '/js/__webpack_hmr',
  },
  output: {
    path: path.join(__dirname, '../dev/js'),
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.IgnorePlugin(/[^/]+\/[\S]+.prod$/),
    new webpack.DefinePlugin({
      __HOST__: `'${host}'`,
      __PORT__: port,
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
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
        loader: require.resolve('babel-loader'),
        exclude: /node_modules/,
        options: {
          presets: ['react-hmre'],
        },
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
      {
        test: [/\.eot$/, /\.ttf$/, /\.svg$/, /\.woff$/, /\.woff2$/],
        loader: 'file-loader',
        options: {
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
    ],
  },
});

const injectPageConfig = baseDevConfig();

injectPageConfig.entry = [customPath, path.join(__dirname, '../browser/extension/inject')];
delete injectPageConfig.hotMiddleware;
delete injectPageConfig.module.rules[0].options;
injectPageConfig.plugins.shift(); // remove HotModuleReplacementPlugin
injectPageConfig.output = {
  path: path.join(__dirname, '../dev/js'),
  filename: 'inject.bundle.js',
};
const appConfig = baseDevConfig();

module.exports = [injectPageConfig, appConfig];
