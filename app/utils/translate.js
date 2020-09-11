import i18next from 'i18next';
import { Constants, WorkspaceConstants } from 'amp-ui';
import Logger from '../modules/util/LoggerManager';

const logger = new Logger('translate');

let store = null;
if (process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line global-require
  store = require('../index.js');
}

/**
 * Translates a message to the current language or to the specified one
 * @param k the message to translate
 * @param lng (optional) the language to which to translate. If missing, then the currently set language is used.
 */
export default (k, lng) => {
  if (k !== undefined) {
    let prefix;
    const workspaceReducer = store != null ? store.default.getState().workspaceReducer : null;
    if (workspaceReducer && workspaceReducer.currentWorkspace
      && workspaceReducer.currentWorkspace[WorkspaceConstants.PREFIX_FIELD]) {
      prefix = Constants.WORKSPACE_PREFIX_SEPARATOR +
        workspaceReducer.currentWorkspace[WorkspaceConstants.PREFIX_FIELD];
    } else {
      prefix = Constants.WORKSPACE_PREFIX_SEPARATOR + Constants.DEFAULT_WORKSPACE_PREFIX;
    }
    const kPrefix = k + prefix;
    // if lng === undefined, then i18next will ignore { lng: undefined } and will use the currently set language
    // we do not use namespaces, while some msgs may include : which is the default i18next ns separator => using &sup;
    let ret = i18next.t(kPrefix, { lng, nsSeparator: '&sup;' });
    if (ret === undefined) {
      ret = kPrefix;
      logger.error(`Missing translation for: ${kPrefix}`);
    }

    // Before first sync.
    if (ret === k + Constants.WORKSPACE_PREFIX_SEPARATOR + Constants.DEFAULT_WORKSPACE_PREFIX) {
      logger.warn(`fallback to key without prefix: ${k}`);
      ret = i18next.t(k, { lng, nsSeparator: '&sup;' });
    }

    // console.log(`translate ${k}  ${ret}`);

    // AMPOFFLINE-1541: Extra check for test.
    if (ret) {
      return ret.replace(prefix, '');
    }
    logger.error('undefined');
    return '';
  }
  return k;
};
