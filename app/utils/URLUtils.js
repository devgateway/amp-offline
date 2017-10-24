import { shell } from 'electron';
import { history } from '../index';
import Logger from '../modules/util/LoggerManager';
import * as RequestConfig from '../modules/connectivity/RequestConfig';

const logger = new Logger('URL utils');

const urlUtils = {

  forwardTo(location) {
    logger.log(`forwardTo( ${location} )`);
    history.push(location);
  },

  goBack() {
    history.goBack();
  },

  redirectExternalLink(method, url) {
    logger.log('redirectExternalLink');
    const externalUrl = RequestConfig.getRequestConfig({ method, url }).url;
    shell.openExternal(externalUrl);
  }
};

module.exports = urlUtils;
