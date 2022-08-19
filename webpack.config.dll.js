import webpack from 'webpack';
import path from 'path';
import validate from 'webpack-validator';
import merge from 'webpack-merge';
import baseConfig from './webpack.config.base';
import { dependencies } from './package.json';

const BLACKLISTED_PKGS = [ // use this to exclude pkgs if they're causing you trouble
  'font-awesome',
  'babel-plugin-webpack-alias',
  'electron-debug',
  'electron-mocha',
  'amp-ui'
]; // We ignore amp-ui library so its possible to hot reload changes

const FORCE_PKGS = [ // use this to add pckgs that are not 1st level dependencies
  'core-js',
  'rc-calendar',
  '@allenfang/react-toastr',
  'react-bootstrap-table',
  'antd/lib/locale-provider/en_US',
  'antd/lib/locale-provider/fr_FR',
  'antd/lib/locale-provider/bg_BG',
  'antd/lib/locale-provider/ca_ES',
  'antd/lib/locale-provider/zh_TW',
  'antd/lib/locale-provider/cs_CZ',
  'antd/lib/locale-provider/nl_NL',
  'antd/lib/locale-provider/et_EE',
  'antd/lib/locale-provider/fi_FI',
  'antd/lib/locale-provider/de_DE',
  'antd/lib/locale-provider/it_IT',
  'antd/lib/locale-provider/ja_JP',
  'antd/lib/locale-provider/ko_KR',
  'antd/lib/locale-provider/pl_PL',
  'antd/lib/locale-provider/pt_BR',
  'antd/lib/locale-provider/ru_RU',
  'antd/lib/locale-provider/sk_SK',
  'antd/lib/locale-provider/es_ES',
  'antd/lib/locale-provider/sv_SE',
  'antd/lib/locale-provider/tr_TR',
  'antd/lib/locale-provider/vi_VN',
  'antd/lib/locale-provider/th_TH'
];

export default validate(merge(baseConfig, {
  entry: {
    lib: Object.keys(dependencies)
      .filter(dep => BLACKLISTED_PKGS.indexOf(dep) === -1)
      .concat(FORCE_PKGS)
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
