import { hashHistory } from 'react-router';
import LoggerManager from '../modules/util/LoggerManager';

const urlUtils = {

  forwardTo(location) {
    LoggerManager.log(`forwardTo( ${location} )`);
    hashHistory.push(location);
  },
  goBack() {
    hashHistory.goBack();
  }
};

module.exports = urlUtils;
