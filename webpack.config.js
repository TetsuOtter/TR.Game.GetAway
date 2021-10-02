// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

//ref : https://qiita.com/pepoipod/items/e41105e8f3afd47dc01c
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require("write-file-webpack-plugin");

const isProduction = process.env.NODE_ENV == 'production';

const config = {
  entry: './src/ts/main.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    open: true,
    host: 'localhost',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/main.html',
      filename: 'main.html',
    }),

    //ref : https://tadtadya.com/webpack4-error-of-version-up-of-copywebpackplugin/
    new CopyWebpackPlugin({
      patterns: [
        {
          context: 'src',
          from: 'img',
          to: './img'
        },
        {
          context: 'src',
          from: 'obj',
          to: './obj'
        },
        {
          context: 'src',
          from: 'style.css',
          to: './'/*,
          globOptions: {
            dot: false,
            gitignore: false,
            ignore: [
              'ts/*.*',
              '*.html',
            ]
          }*/
        },
      ]
    }),
    new WriteFilePlugin()
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        exclude: ['/node_modules/'],
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';

    config.plugins.push(new WorkboxWebpackPlugin.GenerateSW());

  } else {
    config.mode = 'development';
  }

  return config;
};
