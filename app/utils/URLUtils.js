import { history } from '../index';
import LoggerManager from '../modules/util/LoggerManager';

const urlUtils = {

  forwardTo(location) {
    LoggerManager.log(`forwardTo( ${location} )`);
    history.push(location);
  },

  goBack() {
    history.goBack();
  }
};

module.exports = urlUtils;
