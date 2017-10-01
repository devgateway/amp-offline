import { history } from '../index';
import LoggerManager from '../modules/util/LoggerManager';

const URL_PATTERN = /^(https?):\/\/(www\.)?([-a-zA-Z0-9@%._+~#=]{2,256})(:[0-9]{2,5})?\b([-a-zA-Z0-9@%_+.~#?&//=]*)$/;

const urlUtils = {

  forwardTo(location) {
    LoggerManager.log(`forwardTo( ${location} )`);
    history.push(location);
  },

  goBack() {
    history.goBack();
  },

  isValidUrl(url) {
    return url && (typeof url === 'string') && url.match(URL_PATTERN);
  }

};

module.exports = urlUtils;
