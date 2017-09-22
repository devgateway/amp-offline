import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import translate from '../../utils/translate';
import FollowUp from '../../components/notifications/followup';
import ConfirmationAlert from '../../components/notifications/confirmationAlert';
import Notification from '../../modules/helpers/NotificationHelper';
import { addConfirmationAlert } from '../../actions/NotificationAction';
import { NOTIFICATION_ORIGIN_UPDATE_CHECK, NOTIFICATION_SEVERITY_WARNING } from '../../utils/constants/ErrorConstants';
import {
  getNewClientVersion,
  goToDownloadPage,
  isCheckForUpdates,
  isMandatoryUpdate,
  isOptionalUpdate,
  STATE_DOWNLOAD_UPDATE_CONFIRMATION_PENDING,
  STATE_DOWNLOAD_UPDATE_CONFIRMED,
  STATE_DOWNLOAD_UPDATE_DISMISSED
} from '../../actions/UpdateAction';
import { STATE_LOGOUT_REQUESTED } from '../../actions/LoginAction';

/**
 * Update trigger component to be loaded on every page in order to notify any updates if available and discard
 * redux state updates for the same new update.
 *
 * It can be enhanced for additional logic later, e.g. if an optional upgrade is discarded then we can remind
 * every X min automatically or on user "remind me later" action.
 *
 * @author Nadejda Mandrescu
 */
class UpdateTrigger extends Component {
  /* eslint-disable react/no-unused-prop-types */
  static propTypes = {
    statusUpdatePending: PropTypes.bool,
    forceToUpdate: PropTypes.bool,
    suggestToUpdate: PropTypes.bool,
    newVersion: PropTypes.string,
    onConfirmationAlert: PropTypes.func.isRequired,
    proceedToUpdateDownload: PropTypes.bool,
    checkForUpdates: PropTypes.bool,
    goToDownloadPage: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      newVersion: this.props.newVersion,
      updateInstallerPath: null
    };
  }

  componentWillMount() {
    this.checkForUpdates(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.checkForUpdates(nextProps);
  }

  checkForUpdates(props) {
    if (props.proceedToUpdateDownload) {
      goToDownloadPage();
    } else if (props.checkForUpdates && (props.forceToUpdate || props.suggestToUpdate)) {
      // we'll show the alert if it is a forced update on each detection
      // TODO we may need to check it quicker immediately on startup or screen navigation
      let isShowAlert = props.forceToUpdate;
      if (this.state.newVersion !== this.props.newVersion) {
        this.setState({ newVersion: this.props.newVersion });
        // if it's first detection of a new update since the app was started, then we'll show it at least once
        // TODO add more rules how often to remind about non mandatory update
        isShowAlert = true;
      }
      if (isShowAlert) {
        this.props.onConfirmationAlert(props.forceToUpdate);
      }
    }
  }

  render() {
    return <div />;
  }
}

const updateConfirmationAlert = (forceUpdate) => {
  const message = forceUpdate ? translate('offlineVersionCritical') : translate('offlineVersionOutdated');
  const downloadNotification = new Notification({
    message,
    origin: NOTIFICATION_ORIGIN_UPDATE_CHECK,
    severity: NOTIFICATION_SEVERITY_WARNING
  });
  const proceedWithDownload = new FollowUp({
    type: STATE_DOWNLOAD_UPDATE_CONFIRMED
  }, translate('Download'));
  const ignoreSuggestion = new FollowUp({
    type: STATE_DOWNLOAD_UPDATE_DISMISSED
  }, translate('Cancel'));
  const proceedWithLogout = new FollowUp({
    type: STATE_LOGOUT_REQUESTED,
    actionData: { logoutConfirmed: true }
  }, translate('Cancel'));
  const actions = [proceedWithDownload, forceUpdate ? proceedWithLogout : ignoreSuggestion];
  return new ConfirmationAlert(downloadNotification, actions, false);
};

export default connect(
  state => ({
    statusUpdatePending: state.ampConnectionStatusReducer.updateInProgress,
    forceToUpdate: isMandatoryUpdate(),
    suggestToUpdate: isOptionalUpdate(),
    newVersion: getNewClientVersion(),
    proceedToUpdateDownload: state.updateReducer.proceedToUpdateDownload,
    checkForUpdates: isCheckForUpdates()
  }),
  dispatch => ({
    onConfirmationAlert: (forceUpdate) => {
      dispatch({ type: STATE_DOWNLOAD_UPDATE_CONFIRMATION_PENDING });
      dispatch(addConfirmationAlert(updateConfirmationAlert(forceUpdate)));
    }
  })
)(UpdateTrigger);
