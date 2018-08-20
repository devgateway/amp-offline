/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Logger from '../../modules/util/LoggerManager';
import { addConfirmationAlert } from '../../actions/NotificationAction';
import { goToSettingsPage, STATE_GO_TO_SETTINGS } from '../../actions/SettingAction';
import { SETTINGS_URL } from '../../utils/Constants';
import Notification from '../../modules/helpers/NotificationHelper';
import { NOTIFICATION_ORIGIN_UPDATE_CHECK, NOTIFICATION_SEVERITY_WARNING } from '../../utils/constants/ErrorConstants';
import FollowUp from '../notifications/followup';
import translate from '../../utils/translate';
import ConfirmationAlert from '../notifications/confirmationAlert';

const logger = new Logger('SettingsTrigger');

/**
 * Settings trigger component to notify the user when some changes like URL settings are detected
 *
 * @author Nadejda Mandrescu
 */
class SettingsTrigger extends Component {
  /* eslint-disable react/no-unused-prop-types */
  static propTypes = {
    location: PropTypes.object.isRequired,
    isNavigateToSettings: PropTypes.bool.isRequired,
    newUrls: PropTypes.array,
    onUrlsConfirmationAlert: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
  }

  componentWillMount() {
    this.checkForUpdates(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.checkForUpdates(nextProps);
  }

  checkForUpdates(props) {
    const { location, newUrls, isNavigateToSettings, onUrlsConfirmationAlert } = props;
    if (location.pathname !== SETTINGS_URL && newUrls) {
      if (isNavigateToSettings) {
        goToSettingsPage();
      } else {
        onUrlsConfirmationAlert();
      }
    }
  }

  render() {
    return <div key="settings-trigger" />;
  }
}

const urlsConfirmationAlert = () => {
  const urlNotification = new Notification({
    message: translate('urlChanges'),
    origin: NOTIFICATION_ORIGIN_UPDATE_CHECK,
    severity: NOTIFICATION_SEVERITY_WARNING
  });
  const proceed = new FollowUp({
    type: STATE_GO_TO_SETTINGS
  }, translate('OK'));
  return new ConfirmationAlert(urlNotification, [proceed], false);
};

export default connect(
  state => ({
    newUrls: state.settingReducer.newUrls,
    isNavigateToSettings: state.settingReducer.isNavigateToSettings,
  }),
  dispatch => ({
    onUrlsConfirmationAlert: () => dispatch(addConfirmationAlert(urlsConfirmationAlert())),
  })
)(SettingsTrigger);
