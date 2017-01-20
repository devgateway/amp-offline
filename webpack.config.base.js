/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import validate from 'webpack-validator';
import {
  dependencies as externals
} from './app/package.json';
import webpack from 'webpack';

export default validate({
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['babel-loader'],
      exclude: /node_modules/
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    },
      {
        test: /Constants.js$/,
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: /__SERVER_URL__/,
              replacement: function (match, p1, offset, string) {
                console.log('server url ' + process.env.npm_package_config_ampServerUrl);
                return process.env.npm_package_config_ampServerUrl;
              }
            }
          ],
        })
      },
      {
        test: /Constants.js$/,
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: /__SERVER_PORT__/,
              replacement: function (match, p1, offset, string) {
                console.log('server port ' + process.env.npm_package_config_ampServerPort);
                return process.env.npm_package_config_ampServerPort;
              }
            }
          ],
        })
      },
      {
        test: /Constants.js$/,
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: /__SERVER_PROTOCOL__/,
              replacement: function (match, p1, offset, string) {
                console.log('server protocol ' + process.env.npm_package_config_ampServerProtocol);
                return process.env.npm_package_config_ampServerProtocol;
              }
            }
          ],
        })
      }
    ],
  },

  output: {
    path: path.join(__dirname, 'app'),
    filename: 'bundle.js',

    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },

  // https://webpack.github.io/docs/configuration.html#resolve
  resolve: {
    extensions: ['', '.js', '.jsx', '.json'],
    packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']
  },

  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./app/package.json').version)
    }), new StringReplacePlugin(),
  ],

  externals: Object.keys(externals || {})
});
