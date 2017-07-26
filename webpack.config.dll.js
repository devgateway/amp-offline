import webpack from 'webpack';
import path from 'path';
import validate from 'webpack-validator';
import merge from 'webpack-merge';
import baseConfig from './webpack.config.base';

export default validate(merge(baseConfig, {
  entry: {
    lib: [
      'react',
      'react-dom',
      'react-redux',
      'react-router',
      'react-router-redux',
      'moment',
      'antd',
      'react-bootstrap',
      'react-bootstrap-table',
      'react-scrollspy',
      'request',
      'underscore',
      'bluebird-queue',
      'nedb',
      'bluebird',
      'crypto-js',
      'jsonschema',
      'text-encoding',
      'bunyan',
      'i18next',
      'i18next-sync-fs-backend',
      'redux',
      'redux-thunk',
      'redux-promise-middleware',
      'redux-logger',
      'moment',
      'rc-menu',
      'core-js'
    ]
  },

  output: {
    path: path.join(__dirname, 'app/libs/dll'),
    filename: '[name].js',
    library: '[name]',
    libraryTarget: 'var'
  },

  plugins: [
    new webpack.DllPlugin({
      path: './app/libs/dll/manifest.json',
      name: '[name]',
      context: __dirname
    })
  ],

  target: 'electron-renderer',
}));
