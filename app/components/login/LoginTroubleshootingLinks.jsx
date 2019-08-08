/* eslint jsx-a11y/href-no-hash: 0 */
import React, { Component, PropTypes } from 'react';
import { FeatureManagerConstants } from 'amp-ui';
import Logger from '../../modules/util/LoggerManager';
import translate from '../../utils/translate';
import FeatureManager from '../../modules/util/FeatureManager';

const logger = new Logger('Login troubleshooting links');

export default class LoginTroubleshootingLinks extends Component {

  static propTypes = {
    changePasswordOnline: PropTypes.func.isRequired,
    resetPasswordOnline: PropTypes.func.isRequired
  };

  constructor() {
    super();
    logger.debug('constructor');
  }

  render() {
    logger.debug('render');
    return (
      <div>
        {(FeatureManager.isFMSettingEnabled(FeatureManagerConstants.PUBLIC_VIEW_CHANGE_PASSWORD, false)) ?
          <a href="#" onClick={this.props.changePasswordOnline.bind(this)}>{translate('Change Password')}</a> : null}
        <br />
        {(FeatureManager.isFMSettingEnabled(FeatureManagerConstants.PUBLIC_VIEW_TROUBLE_SIGN_IN, false)) ?
          <a href="#" onClick={this.props.resetPasswordOnline.bind(this)}>{translate('Trouble signing in?')}</a> : null}
      </div>
    );
  }
}
