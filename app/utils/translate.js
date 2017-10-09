import i18next from 'i18next';
import LoggerManager from '../modules/util/LoggerManager';

/**
 * Translates a message to the current language or to the specified one
 * @param k the message to translate
 * @param lng (optional) the language to which to translate. If missing, then the currently set language is used.
 */
export default (k, lng) => {
  let ret = i18next.t(k, { lng });
  if (ret === undefined) {
    ret = k;
    LoggerManager.error(`Missing translation for: ${k}`);
  }
  // console.log(`translate ${k}  ${ret}`);
  return ret;
};
