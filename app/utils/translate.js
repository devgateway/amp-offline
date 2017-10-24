import i18next from 'i18next';
import Logger from '../modules/util/LoggerManager';

const logger = new Logger('translate');

export default (k) => {
  let ret = i18next.t(k);
  if (ret === undefined) {
    ret = k;
    logger.error(`Missing translation for: ${k}`);
  }
  // console.log(`translate ${k}  ${ret}`);
  return ret;
};
