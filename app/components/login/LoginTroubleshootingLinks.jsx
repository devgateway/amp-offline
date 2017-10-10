/* eslint jsx-a11y/href-no-hash: 0 */
import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../modules/util/LoggerManager';
import translate from '../../utils/translate';

export default class LoginTroubleshootingLinks extends Component {

  static propTypes = {
    changePasswordOnline: PropTypes.func.isRequired,
    resetPasswordOnline: PropTypes.func.isRequired
  };

  constructor() {
    super();
    LoggerManager.debug('constructor');
  }

  render() {
    LoggerManager.debug('render');
    return (
      <div>
        <a href="#" onClick={this.props.changePasswordOnline.bind(this)}>{translate('Change Password')}</a>
        <br />
        <a href="#" onClick={this.props.resetPasswordOnline.bind(this)}>{translate('Trouble signing in?')}</a>
      </div>
    );
  }
}
