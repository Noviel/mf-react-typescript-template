const path = require('path');
const webpack = require('webpack');
const ModuleFederationPlugin = require('webpack').container.ModuleFederationPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const { dependencies } = require('./package.json');

const babelLoader = {
  loader: 'babel-loader',
  options: {},
};

module.exports = (_, options) => {
  const { mode } = options;
  const isProduction = mode === 'production' || process.env.NODE_ENV === 'production';

  if (!process.env.NODE_ENV) {
    if (mode) {
      process.env.NODE_ENV = mode;
    } else {
      // set enrivomnet to `development` if not specified explicitly
      process.env.NODE_ENV = 'development';
    }
  }

  console.log(`Building in ${isProduction ? 'production' : 'development'} mode.`);

  return {
    entry: './src/index',
    mode: mode || (isProduction ? 'production' : 'development'),
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      port: 3002,
      /* wait when HMR with module federation is fixed */
      // hot: true,
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: 'auto',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: babelLoader,
        },
        {
          test: /\.worker\.(t|j)s$/,
          exclude: /node_modules/,
          use: [{ loader: 'worker-loader', options: { inline: 'fallback' } }, babelLoader],
        },
        {
          test: /\.css$/i,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
              },
            },
            'postcss-loader',
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
          type: 'asset',
        },
      ],
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
      new ModuleFederationPlugin({
        name: 'mf_react_typescript',
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/App',
        },
        shared: [
          {
            ...dependencies,
            'react-dom': {
              singleton: true,
              requiredVersion: dependencies['react-dom'],
            },
            react: {
              singleton: true,
              requiredVersion: dependencies['react'],
            },
          },
        ],
      }),
      isProduction
        ? new MiniCssExtractPlugin({
            filename: '[name].[hash].css',
            chunkFilename: '[id].css',
          })
        : null,
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
      new CleanWebpackPlugin(),
    ].filter(Boolean),
  };
};
