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
  SYNCUP_FORCE_DAYS,
  SYNCUP_SYNC_REQUESTED_AT,
  SYNCUP_STATUS_SUCCESS,
  NR_SYNC_HISTORY_ENTRIES
} from '../../utils/Constants';
import {
  NOTIFICATION_ORIGIN_SYNCUP_PROCESS,
  NOTIFICATION_SEVERITY_WARNING
} from '../../utils/constants/ErrorConstants';
import { STATE_LOGOUT_DISMISS_TO_SYNC, STATE_LOGOUT_REQUESTED } from '../../actions/LoginAction';
import {
  startSyncUpIfConnectionAvailable,
  dismissSyncAndChooseWorkspace,
  loadSyncUpHistory,
  STATE_SYNCUP_DISMISSED
} from '../../actions/SyncUpAction';
import { addConfirmationAlert } from '../../actions/NotificationAction';
import Notification from '../../modules/helpers/NotificationHelper';
import {
  PARTIAL,
  STATES_PARTIAL_SUCCESS
} from '../../modules/syncup/SyncUpUnitState';

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
    logoutDismissedToSync: PropTypes.bool.isRequired,
    currentUserHistory: PropTypes.object
  };

  static cancelSync() {
    LoggerManager.log('cancelSync');
    LoggerManager.log('To be implemented on AMPOFFLINE-208');
  }

  static getLogStatus(log) {
    const { units } = log;
    const allModulesPartialSuccess = units &&
      units.every(unit =>
        STATES_PARTIAL_SUCCESS.indexOf(unit.state) > -1);

    const atLeastOneModulePartial = units &&
      units.some(unit =>
        unit.state === PARTIAL);

    if (allModulesPartialSuccess && atLeastOneModulePartial) {
      return translate('Partial');
    } else if (log.status === SYNCUP_STATUS_SUCCESS) {
      return translate('Success');
    } else {
      return translate('Failed');
    }
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
    const route = this.context.router.routes[this.context.router.routes.length - 1];
    this.context.router.setRouteLeaveHook(route, this.routerWillLeave.bind(this));
    if (!this.props.currentWorkspace) {
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

  routerWillLeave() {
    LoggerManager.log('routerWillLeave');
    // FFR: https://github.com/ReactTraining/react-router/blob/v3/docs/guides/ConfirmingNavigation.md
    return !this.props.syncUpReducer.forceSyncUp || this.props.logoutConfirmed;
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
          <div >
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
    const { syncUpReducer, currentUserHistory } = this.props;
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

        {!!currentUserHistory.length &&
          <div className="container">
            <div className="row">
              <div className="col-sm-12">
                <table className="table table-stripped">
                  <caption>
                    <h3>{translate('History')}</h3>
                  </caption>
                  <thead>
                    <tr>
                      <th />
                      <th>{translate('completedOn')}</th>
                      <th>{translate('Status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUserHistory.map((log, index) => (
                      <tr key={log.id}>
                        <td>{index + 1}</td>
                        <td>{DateUtils.createFormattedDateTime(log['sync-date'])}</td>
                        <td>{this.constructor.getLogStatus(log)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

        <SyncUpProgressDialogModal show={this.props.syncUpReducer.syncUpInProgress} onClick={SyncUp.cancelSync} />
      </div>
    );
  }
}

const getSyncStatusUpMessage = (syncUpReducer) => {
  // detect message & build notification
  let message = null;
  if (syncUpReducer.didUserSuccessfulSyncUp) {
    if (syncUpReducer.daysFromLastSuccessfulSyncUp > SYNCUP_FORCE_DAYS) {
      message = translate('tooOldSyncWarning');
    } else {
      const successfulAt = DateUtils.createFormattedDate(syncUpReducer.lastSuccessfulSyncUp[SYNCUP_SYNC_REQUESTED_AT]);
      message = `${translate('syncWarning')} ${translate('lastSuccessfulSyncupDate').replace('%date%', successfulAt)}`;
    }
  } else if (syncUpReducer.didSyncUp) {
    message = `${translate('syncWarning')} ${translate('allPreviousSyncUpFailed')}`;
  } else {
    message = translate('syncWarning');
  }
  return message;
};

const syncConfirmationAlert = (syncUpReducer) => {
  const message = getSyncStatusUpMessage(syncUpReducer);
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
  const proceedWithSync = new FollowUp({
    type: STATE_LOGOUT_DISMISS_TO_SYNC
  }, translate('Sync'));
  const actions = [proceedWithSync, syncUpReducer.forceSyncUp ? proceedWithLogout : proceedWithWorkspace];
  // generate confirmation alert configuration
  return new ConfirmationAlert(syncNotification, actions, false);
};

export default connect(
  state => {
    const { syncUpReducer, userReducer } = state;
    return {
      syncUpReducer,
      currentWorkspace: state.workspaceReducer.currentWorkspace,
      logoutConfirmed: state.loginReducer.logoutConfirmed,
      logoutDismissedToSync: state.loginReducer.logoutDismissedToSync,
      currentUserHistory: syncUpReducer.historyData
        .filter(datum => datum['requested-by'] === userReducer.userData.id)
        .slice(0, NR_SYNC_HISTORY_ENTRIES)
        .sort((a, b) => new Date(a['sync-date']) - new Date(b['sync-date']))
    };
  },

  dispatch => ({
    onSyncConfirmationAlert: (syncUpReducer) => dispatch(addConfirmationAlert(syncConfirmationAlert(syncUpReducer)))
  })
)(SyncUp);
