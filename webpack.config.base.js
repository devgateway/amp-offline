/* eslint no-unused-vars: 0 */

/**
 * Base webpack config used across other specific configs
 */
import StringReplacePlugin from 'string-replace-webpack-plugin';
import path from 'path';
import validate from 'webpack-validator';
import webpack from 'webpack';
import { execSync } from 'child_process';

export default validate({
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['babel-loader?cacheDirectory'],
      exclude: /node_modules/
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }, {
      test: /Constants.js$/,
      loader: StringReplacePlugin.replace({
        replacements: [
          {
            pattern: /__SERVER_URL__/,
            replacement: (match, p1, offset, string) => {
              console.log(`server url ${process.env.npm_package_config_ampServerUrl}`);
              return process.env.npm_package_config_ampServerUrl;
            }
          }
        ],
      })
    }, {
      test: /Constants.js$/,
      loader: StringReplacePlugin.replace({
        replacements: [
          {
            pattern: /__SERVER_PORT__/,
            replacement: (match, p1, offset, string) => {
              console.log(`server port ${process.env.npm_package_config_ampServerPort}`);
              return process.env.npm_package_config_ampServerPort;
            }
          }
        ],
      })
    }, {
      test: /Constants.js$/,
      loader: StringReplacePlugin.replace({
        replacements: [
          {
            pattern: /__SERVER_PROTOCOL__/,
            replacement: (match, p1, offset, string) => {
              console.log(`server protocol ${process.env.npm_package_config_ampServerProtocol}`);
              return process.env.npm_package_config_ampServerProtocol;
            }
          }
        ],
      })
    }],
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
      __COMMIT_HASH__: JSON.stringify(process.env.COMMIT_HASH),
      __BRANCH_NAME__: JSON.stringify(process.env.BRANCH_NAME),
      __PR_NR__: JSON.stringify(process.env.PR_NR),
      __BUILD_DATE__: JSON.stringify(new Date())
    }), new StringReplacePlugin(),
  ],

  externals: [
    'dtrace-provider'
  ]
});
