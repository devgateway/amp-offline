import i18next from 'i18next';
import LoggerManager from '../modules/util/LoggerManager';

export default (k) => {
  let ret = i18next.t(k);
  if (ret === undefined) {
    ret = k;
    LoggerManager.error(`Missing translation for: ${k}`);
  }
  // console.log(`translate ${k}  ${ret}`);
  return ret;
};
