/* eslint jsx-a11y/href-no-hash: 0 */
import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../modules/util/LoggerManager';
import translate from '../../utils/translate';
import FeatureManager from '../../modules/util/FeatureManager';
import * as FMC from '../../utils/constants/FeatureManagerConstants';

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
        {(FeatureManager.isFMSettingEnabled(FMC.PUBLIC_VIEW_CHANGE_PASSWORD, false)) ?
          <a href="#" onClick={this.props.changePasswordOnline.bind(this)}>{translate('Change Password')}</a> : null}
        <br />
        {(FeatureManager.isFMSettingEnabled(FMC.PUBLIC_VIEW_TROUBLE_SIGN_IN, false)) ?
          <a href="#" onClick={this.props.resetPasswordOnline.bind(this)}>{translate('Trouble signing in?')}</a> : null}
      </div>
    );
  }
}
