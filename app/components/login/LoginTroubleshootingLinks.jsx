import React, { Component, PropTypes } from 'react';
import styles from './Login.css';
import LoggerManager from '../../modules/util/LoggerManager';
import translate from '../../utils/translate';

export default class LoginTroubleshootingLinks extends Component {

  static propTypes = {
    changePasswordOnline: PropTypes.func.isRequired,
    solveLoginProblemsOnline: PropTypes.func.isRequired
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
        <a href="#" onClick={this.props.solveLoginProblemsOnline.bind(this)}>{translate('Trouble signing in?')}</a>
      </div>
    );
  }
}
