import { shell } from 'electron';
import { history } from '../index';
import LoggerManager from '../modules/util/LoggerManager';
import * as RequestConfig from '../modules/connectivity/RequestConfig';
import { AMP_SUFFIX, PP_SUFFIX } from '../modules/connectivity/AmpApiConstants';

const URL_PATTERN = /^(https?):\/\/(www\.)?([-a-zA-Z0-9@%._+~#=]{2,256})(:[0-9]{2,5})?\b([-a-zA-Z0-9@%_+.~#?&//=]*)$/;

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
  },

  isValidUrl(url) {
    return !!this.matchUrl(this.normalizeUrl(url));
  },

  matchUrl(url) {
    return url && (typeof url === 'string') && url.match(URL_PATTERN);
  },

  normalizeUrl(url) {
    if (url) {
      url = url.trim();
      while (url.endsWith('/')) {
        url = url.substr(0, url.length - 1);
      }
      if (!url.startsWith('http')) {
        while (url.startsWith('/')) {
          url.substr(1, url.length);
        }
        url = `https://${url}`;
      }
    }
    return url;
  },

  /**
   * Provides possible fixed version(s) of setup URL
   * @param url the original url input, that we assume to have been normalized & validated
   * @return {Array} possible set of working urls
   */
  getPossibleUrlSetupFixes(url: String) {
    const options = [];
    if (url) {
      // always keep the actual URL, since current assumptions for detection may change
      options.push(url);
      const publicPortalIndex = url.indexOf(PP_SUFFIX);
      const ampPageIndex = url.indexOf(AMP_SUFFIX);
      if (publicPortalIndex > 0) {
        options.push(url.substr(url, publicPortalIndex));
      } else if (ampPageIndex > 0) {
        options.push(url.substr(url, ampPageIndex));
      } else {
        let pathSplitPoint = url.indexOf('/', 'https://'.length);
        while (pathSplitPoint > 0) {
          options.push(url.substr(0, pathSplitPoint));
          pathSplitPoint = url.indexOf('/', pathSplitPoint + 1);
        }
      }
      // add https or http alternative
      const otherProtocol = url.substr(0, 5)[4] === ':' ? 'https://' : 'http://';
      const oldProtocolEnd = otherProtocol === 'https://' ? 'http://'.length : 'https://'.length;
      options.forEach(alternative => options.push(`${otherProtocol}${alternative.substr(oldProtocolEnd)}`));
    }
    return options;
  }

};

module.exports = urlUtils;
