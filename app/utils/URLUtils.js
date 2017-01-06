import { hashHistory } from 'react-router';

const urlUtils = {

  forwardTo(location) {
    console.log('forwardTo(${location})');
    hashHistory.push(location);
  },
  goBack() {
    hashHistory.goBack();
  }
};

module.exports = urlUtils;
