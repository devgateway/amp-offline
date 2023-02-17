import { shell } from 'electron';
import URI from 'urijs';
import fileUrl from 'file-url';
import { history } from '../index';
import Logger from '../modules/util/LoggerManager';
import * as RequestConfig from '../modules/connectivity/RequestConfig';
import { AMP_SUFFIX, PP_SUFFIX } from '../modules/connectivity/AmpApiConstants';

const URL_PATTERN = /^(https?):\/\/(www\.)?([-a-zA-Z0-9@%._+~#=]{2,256})(:[0-9]{2,5})?\b([-a-zA-Z0-9@%_+.~#?&//=]*)$/;

const logger = new Logger('URL utils');

const urlUtils = {

  forwardTo(location) {
    logger.log(`forwardTo( ${location} )`);
    history.push(location);
  },

  goBack() {
    history.goBack();
  },

  redirectExternalLink(method, url, paramsMap) {
    logger.log('redirectExternalLink');

    const externalUrl = RequestConfig.getRequestConfig({ method, url, paramsMap }).url;

    shell.openExternal(externalUrl);
  },

  isValidUrl(url) {
    return !!this.matchUrl(this.normalizeUrl(url));
  },

  matchUrl(url) {
    return url && (typeof url === 'string') && url.match(URL_PATTERN);
  },

  normalizeUrl(url, fallbackProtocol = 'https') {
    if (url) {
      url = url.trim()
        .toLowerCase();
      while (url.endsWith('/')) {
        url = url.substr(0, url.length - 1);
      }
      while (url.startsWith('/')) {
        url = url.substr(1, url.length);
      }
      try {
        const uri = new URI(url);
        if (!uri.protocol()) {
          url = uri.protocol(fallbackProtocol)
            .toString();
        }
      } catch (error) {
        logger.warn(error);
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
  },

  /**
   * Parses the passed query string into an object
   * @param url
   * @returns {{}} {propertyName: propertyValue}
   */
  parseQuery(url) {
    return URI.parseQuery(url);
  },

  toFileUrl(filePath) {
    return fileUrl(filePath);
  }

};

module.exports = urlUtils;
