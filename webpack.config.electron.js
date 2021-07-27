/**
 * Build config for electron 'Main Process' file
 */

import path from 'path';
import webpack from 'webpack';
import validate from 'webpack-validator';
import BabelMinifyWebpackPlugin from 'babel-minify-webpack-plugin';
import merge from 'webpack-merge';
import baseConfig from './webpack.config.base';

export default validate(merge(baseConfig, {

  entry: ['babel-polyfill', './app/main.development'],

  // 'main.js' in root
  output: {
    path: path.join(__dirname, 'main'),
    filename: 'main.js'
  },

  plugins: [
    // Add source map support for stack traces in node
    // https://github.com/evanw/node-source-map-support
    // new webpack.BannerPlugin(
    //   'require("source-map-support").install();',
    //   { raw: true, entryOnly: false }
    // ),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new BabelMinifyWebpackPlugin({}, {})
  ],

  /**
   * Set targed to Electron speciffic node.js env.
   * https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
   */
  target: 'electron-main',

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false
  },
}));
