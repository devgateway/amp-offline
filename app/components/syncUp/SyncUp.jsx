import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './SyncUp.css';
import ErrorMessage from '../common/ErrorMessage';
import InfoMessage from '../common/InfoMessage';
import Loading from '../common/Loading';
import Button from '../i18n/Button';
import LoggerManager from '../../modules/util/LoggerManager';
import SyncUpProgressDialogModal from './SyncUpProgressDialogModal';
import DateUtils from '../../utils/DateUtils';
import translate from '../../utils/translate';
import FollowUp from '../notifications/followup';
import ConfirmationAlert from '../notifications/confirmationAlert';
import {
  NOTIFICATION_ORIGIN_SYNCUP_PROCESS,
  NOTIFICATION_SEVERITY_WARNING
} from '../../utils/constants/ErrorConstants';
import { STATE_LOGOUT_REQUESTED } from '../../actions/LoginAction';
import {
  dismissSyncAndChooseWorkspace,
  loadSyncUpHistory,
  startSyncUp,
  startSyncUpIfConnectionAvailable,
  STATE_SYNCUP_DISMISSED
} from '../../actions/SyncUpAction';
import { addConfirmationAlert } from '../../actions/NotificationAction';
import Notification from '../../modules/helpers/NotificationHelper';
import SyncUpManager from '../../modules/syncup/SyncUpManager';
import { SYNCUP_HISTORY_TARGET } from '../../utils/Constants';

// opposite of `pluck`, provided an object, returns a function that accepts a string
// and returns the corresponding field of that object
const valuesOf = obj => field => obj[field];

// accepts a string:boolean map and concats the keys with truthy values into a string that can be passed to `classNames`
const classes = rules => Object.keys(rules).filter(valuesOf(rules)).join(' ');

class SyncUp extends Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  static propTypes = {
    syncUpReducer: PropTypes.object.isRequired,
    currentWorkspace: PropTypes.object,
    onSyncConfirmationAlert: PropTypes.func.isRequired,
    logoutConfirmed: PropTypes.bool.isRequired,
    logoutDismissedToSync: PropTypes.bool.isRequired
  };

  static cancelSync() {
    LoggerManager.log('cancelSync');
    LoggerManager.log('To be implemented on AMPOFFLINE-208');
  }

  constructor() {
    super();
    LoggerManager.log('constructor');
  }

  componentWillMount() {
    // TODO: this is a temporary change to be able to adjust the page; roper solution should come from AMPOFFLINE-314
    loadSyncUpHistory();
  }

  componentDidMount() {
    const { syncUpInProgress } = this.props.syncUpReducer;
    // history target is set only from the menu, which means explicit user navigation
    // otherwise brought in here to suggest / require user to sync
    if (!syncUpInProgress && this.context.router.params.target !== SYNCUP_HISTORY_TARGET) {
      this.props.onSyncConfirmationAlert(this.props.syncUpReducer);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.syncUpReducer.syncUpInProgress !== this.props.syncUpReducer.syncUpInProgress &&
      !nextProps.syncUpReducer.syncUpInProgress
    ) {
      loadSyncUpHistory();
    }
    if (nextProps.syncUpReducer.syncUpRejected) {
      const { logoutConfirmed, logoutDismissedToSync } = this.props;
      if (!logoutConfirmed && !logoutDismissedToSync && !this.props.currentWorkspace) {
        dismissSyncAndChooseWorkspace();
      }
    }
  }

  selectContentElementToDraw() {
    LoggerManager.log('selectContentElementToDraw');
    const { syncUpReducer } = this.props;
    if (this.props.syncUpReducer.loadingSyncHistory === true || this.props.syncUpReducer.syncUpInProgress === true) {
      return <Loading />;
    } else {
      const { errorMessage, didUserSuccessfulSyncUp, lastSuccessfulSyncUp } = syncUpReducer;
      if (errorMessage) {
        return (
          <div>
            {errorMessage && <ErrorMessage message={errorMessage} />}
          </div>
        );
      }
      if (didUserSuccessfulSyncUp) {
        const message = translate('lastSuccessfulSyncupDate')
          .replace('%date%', DateUtils.createFormattedDate(lastSuccessfulSyncUp['sync-date']));

        return (
          <div className="container">
            <div className="row">
              <div className="col-sm-12">
                <InfoMessage type="success" message={message} timeout={0} />
              </div>
            </div>
          </div>
        );
      }
    }
  }

  render() {
    LoggerManager.log('render');
    const { syncUpReducer } = this.props;
    const { loadingSyncHistory, syncUpInProgress } = syncUpReducer;
    return (
      <div className={styles.container}>
        <div className={styles.display_inline}>
          <Button
            type="button"
            text={translate('Start Sync Up')}
            className={classes({
              'btn btn-success': true,
              disabled: loadingSyncHistory || syncUpInProgress
            })}
            onClick={startSyncUpIfConnectionAvailable}
          />
        </div>
        <div className={styles.display_inline}>
          <div className={classes({ [styles.loader]: loadingSyncHistory || syncUpInProgress })} />
        </div>
        <hr />
        {this.selectContentElementToDraw()}

        <SyncUpProgressDialogModal show={this.props.syncUpReducer.syncUpInProgress} onClick={SyncUp.cancelSync} />
      </div>
    );
  }
}

const syncConfirmationAlert = (syncUpReducer) => {
  const message = SyncUpManager.getSyncUpStatusMessage();
  const syncNotification = new Notification({
    message,
    origin: NOTIFICATION_ORIGIN_SYNCUP_PROCESS,
    severity: NOTIFICATION_SEVERITY_WARNING
  });
  // build action buttons
  const proceedWithLogout = new FollowUp({
    type: STATE_LOGOUT_REQUESTED,
    actionData: { logoutConfirmed: true }
  }, translate('Cancel'));
  const proceedWithWorkspace = new FollowUp({
    type: STATE_SYNCUP_DISMISSED
  }, translate('Ignore'));
  const proceedWithSync = new FollowUp(() => startSyncUp(), translate('Sync'));
  const actions = [proceedWithSync, syncUpReducer.forceSyncUp ? proceedWithLogout : proceedWithWorkspace];
  // generate confirmation alert configuration
  return new ConfirmationAlert(syncNotification, actions, false);
};

export default connect(
  state => ({
    syncUpReducer: state.syncUpReducer,
    currentWorkspace: state.workspaceReducer.currentWorkspace,
    logoutConfirmed: state.loginReducer.logoutConfirmed,
    logoutDismissedToSync: state.loginReducer.logoutDismissedToSync
  }),
  dispatch => ({
    onSyncConfirmationAlert: (syncUpReducer) => dispatch(addConfirmationAlert(syncConfirmationAlert(syncUpReducer)))
  })
)(SyncUp);
