import { shell } from 'electron';
import { history } from '../index';
import LoggerManager from '../modules/util/LoggerManager';
import * as RequestConfig from '../modules/connectivity/RequestConfig';

const urlUtils = {

  forwardTo(location) {
    LoggerManager.log(`forwardTo( ${location} )`);
    history.push(location);
  },

  goBack() {
    history.goBack();
  },

  redirectExternalLink(method, url) {
    LoggerManager.log('redirectExternalLink');
    const externalUrl = RequestConfig.getRequestConfig({ method, url }).url;
    shell.openExternal(externalUrl);
  }
};

module.exports = urlUtils;
