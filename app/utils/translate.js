import i18next from 'i18next';
import { Constants } from 'amp-ui';
import Logger from '../modules/util/LoggerManager';
import store from '../index';

const logger = new Logger('translate');

/**
 * Translates a message to the current language or to the specified one
 * @param k the message to translate
 * @param lng (optional) the language to which to translate. If missing, then the currently set language is used.
 */
export default (k, lng) => {
  if (k !== undefined) {
    let prefix;
    if (store.getState().workspaceReducer
    && store.getState().workspaceReducer.currentWorkspace
    && store.getState().workspaceReducer.currentWorkspace[Constants.WORKSPACE_PREFIX_FIELD]) {
      prefix = Constants.WORKSPACE_PREFIX_SEPARATOR +
        store.getState().workspaceReducer.currentWorkspace[Constants.WORKSPACE_PREFIX_FIELD];
    } else {
      prefix = Constants.WORKSPACE_PREFIX_SEPARATOR + Constants.DEFAULT_WORKSPACE_PREFIX;
    }
    k += prefix;
    // if lng === undefined, then i18next will ignore { lng: undefined } and will use the currently set language
    // we do not use namespaces, while some msgs may include : which is the default i18next ns separator => using &sup;
    let ret = i18next.t(k, { lng, nsSeparator: '&sup;' });
    if (ret === undefined) {
      ret = k;
      logger.error(`Missing translation for: ${k}`);
    }
    // console.log(`translate ${k}  ${ret}`);
    return ret.replace(prefix, '');
  }
  return k;
};
