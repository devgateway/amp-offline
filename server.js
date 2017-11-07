/* eslint-disable no-console */
/**
 * Setup and run the development server for Hot-Module-Replacement
 * https://webpack.github.io/docs/hot-module-replacement-with-webpack.html
 */

import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import StringReplacePlugin from 'string-replace-webpack-plugin';
import { spawn } from 'child_process';
import * as LoggerSettings from './app/utils/LoggerSettings';

import config from './webpack.config.development';

/* On DEV we want to keep using browser console functions for logging since is the only way
 to see the origin (file and line) of the log.
 Note: Dont add it to webpack.config.development because that file might be used not only for DEV.*/
if (process.env.FORCE_LOGGER !== 'true') {
  let keepDebugLogsFor = LoggerSettings.getDefaultConfig(process.env.NODE_ENV).keepDebugLogsFor;
  if (keepDebugLogsFor) {
    keepDebugLogsFor = keepDebugLogsFor.length ? keepDebugLogsFor : ['.jsx?'];
  } else {
    keepDebugLogsFor = [];
  }
  keepDebugLogsFor = new RegExp(`${keepDebugLogsFor.map(f => f.replace('.', '\\.')).join('|')}|node_modules.*$`);
  config.module.loaders.push(
    {
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: StringReplacePlugin.replace({
        replacements: [{ pattern: /logger.log/g, replacement: () => ('console.log') },
          { pattern: /logger.debug/g, replacement: () => ('console.debug') },
          { pattern: /logger.warn/g, replacement: () => ('console.warn') },
          { pattern: /logger.error/g, replacement: () => ('console.error') }
        ],
      })
    },
    {
      test: /\.jsx?$/,
      exclude: keepDebugLogsFor,
      loader: StringReplacePlugin.replace({
        replacements: [{ pattern: /logger.debug/g, replacement: () => ('// console.debug') }],
      })
    });
}

const argv = require('minimist')(process.argv.slice(2));

const app = express();
const compiler = webpack(config);
const PORT = process.env.PORT || 3000;

const wdm = webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
  stats: {
    colors: true
  }
});

app.use(wdm);

app.use(webpackHotMiddleware(compiler));

const server = app.listen(PORT, 'localhost', serverError => {
  if (serverError) {
    return console.error(serverError);
  }

  if (argv['start-hot']) {
    spawn('npm', ['run', 'start-hot'], { shell: true, env: process.env, stdio: 'inherit' })
      .on('close', code => process.exit(code))
      .on('error', spawnError => console.error(spawnError));
  }

  console.log(`Listening at http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('Stopping dev server');
  wdm.close();
  server.close(() => {
    process.exit(0);
  });
});
