import i18next from 'i18next';
import Logger from '../modules/util/LoggerManager';

const logger = new Logger('translate');

/**
 * Translates a message to the current language or to the specified one
 * @param k the message to translate
 * @param lng (optional) the language to which to translate. If missing, then the currently set language is used.
 */
export default (k, lng) => {
  // if lng === undefined, then i18next will ignore { lng: undefined } and will use the currently set language
  let ret = i18next.t(k, { lng });
  if (ret === undefined) {
    ret = k;
    logger.error(`Missing translation for: ${k}`);
  }
  // console.log(`translate ${k}  ${ret}`);
  return ret;
};
