/* eslint-disable react/no-unused-prop-types,class-methods-use-this */
import React, { Component } from 'react';
import { ErrorConstants } from 'amp-ui';
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import DatabaseSanityStatus from '../../modules/database/sanity/DatabaseSanityStatus';
import { addConfirmationAlert } from '../../actions/NotificationAction';
import NotificationsContainer from '../notifications';
import Notification from '../../modules/helpers/NotificationHelper';
import FollowUp, { BUTTON_TYPE_CANCEL, BUTTON_TYPE_OK } from '../notifications/followup';
import {
  cancelDBCleanup,
  doDBCleanup,
  flagCleanupComplete,
  restartSanityCheck,
  STATE_DB_HEAL_CANCEL,
  STATE_DB_HEAL_FAILURE_MSG_VIEWED,
  STATE_DB_HEAL_PROCEED,
  STATE_DB_RESTART_SANITY_CHECK
} from '../../actions/SanityCheckAction';
import ConfirmationAlert from '../notifications/confirmationAlert';
import Logger from '../../modules/util/LoggerManager';
import InProgress from '../common/InProgress';
import * as SCC from '../../utils/constants/SanityCheckConstants';
import ActionDef from '../../modules/util/ActionDef';
import SetupConfig from '../../modules/setup/SetupConfig';
import * as Utils from '../../utils/URLUtils';

const logger = new Logger('Sanity');

/**
 * Sanity window
 * @author Nadejda Mandrescu
 */
class Sanity extends Component {
  static propTypes = {
    sanityStatus: PropTypes.instanceOf(DatabaseSanityStatus).isRequired,
    onDBHealingConfirmationAlert: PropTypes.func.isRequired,
    isPerformDBCleanup: PropTypes.bool,
    isDBCleanupInProgress: PropTypes.bool,
    isCancelDBCleanup: PropTypes.bool,
    isDBCleanupCompleted: PropTypes.bool,
    isDBFailureMsgViewed: PropTypes.bool,
  };

  componentWillMount() {
    this.checkNewProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.checkNewProps(nextProps);
  }

  checkNewProps(props) {
    const {
      sanityStatus, isPerformDBCleanup, isDBCleanupInProgress, isCancelDBCleanup, isDBCleanupCompleted,
      isDBFailureMsgViewed, isSanityCheckRestart, onDBHealingConfirmationAlert
    } = props;
    if (isSanityCheckRestart) {
      restartSanityCheck();
    } else if (isDBCleanupCompleted) {
      if (!sanityStatus.isHealedSuccessfully && !isDBFailureMsgViewed) {
        onDBHealingConfirmationAlert(sanityStatus, true);
      } else {
        flagCleanupComplete(sanityStatus.isHealedSuccessfully);
      }
    } else if (isCancelDBCleanup) {
      logger.warn('DB cleanup was canceled by the user. Closing the app.');
      cancelDBCleanup(sanityStatus);
    } else if (isPerformDBCleanup) {
      if (!isDBCleanupInProgress) {
        logger.warn('Starting DB cleanup');
        doDBCleanup(sanityStatus);
      }
    } else if (sanityStatus.isDBIncompatibilityDetected && !sanityStatus.isHealedSuccessfully) {
      logger.log('Notifying user about DB corruption');
      onDBHealingConfirmationAlert(sanityStatus);
    }
  }

  render() {
    const { isDBCleanupInProgress } = this.props;
    return (
      <div>
        <NotificationsContainer asModal={false} />
        {isDBCleanupInProgress && <InProgress />}
      </div>
    );
  }

}

const dbHealingConfirmationAlert = (databaseSanityStatus: DatabaseSanityStatus, isOnFailure = false) => {
  const isNoDiskSpace = databaseSanityStatus.healReason === SCC.REASON_NO_DISK_SPACE;
  let message;
  let okMsg = 'OK';
  let title = 'AMP Offline Message';
  let okState = STATE_DB_HEAL_PROCEED;
  const tagActions = [];
  if (isOnFailure) {
    if (databaseSanityStatus.details.failureErrorReportPath) {
      message = 'dbCleanupFailed';
      tagActions.push(new ActionDef({ href: Utils.toFileUrl(databaseSanityStatus.details.failureErrorReportPath) }));
    } else {
      message = 'dbCleanupFailedFallback';
      tagActions.push(new ActionDef({ href: Utils.toFileUrl(SetupConfig.getLogsDir()) }));
      tagActions.push(new ActionDef({ href: Utils.toFileUrl(SetupConfig.getDatabaseDir()) }));
    }
    tagActions.push(new ActionDef({ href: Utils.toFileUrl(SetupConfig.getDatabaseDir()) }));
    okState = STATE_DB_HEAL_FAILURE_MSG_VIEWED;
  } else if (isNoDiskSpace) {
    message = 'noDiskSpace';
    okMsg = 'tryAgain';
    okState = STATE_DB_RESTART_SANITY_CHECK;
  } else if (databaseSanityStatus.isDBIncompatibilityExpected) {
    message = 'dbCompatibilityError';
  } else {
    if (databaseSanityStatus.details.errorReportPath) {
      message = 'dbCorrupted';
      tagActions.push(new ActionDef({ href: Utils.toFileUrl(databaseSanityStatus.details.errorReportPath) }));
    } else {
      message = 'dbCorruptedFallback';
      tagActions.push(new ActionDef({ href: Utils.toFileUrl(SetupConfig.getLogsDir()) }));
      tagActions.push(new ActionDef({ href: Utils.toFileUrl(SetupConfig.getDatabaseDir()) }));
    }
    okMsg = 'cleanup';
    title = 'Confirmation required';
  }
  const dbHealNotification = new Notification({
    message,
    translateMsg: false,
    tagActions,
    origin: ErrorConstants.NOTIFICATION_ORIGIN_SANITY_CHECK,
    severity: ErrorConstants.NOTIFICATION_SEVERITY_ERROR
  });

  const proceed = new FollowUp({ type: okState }, okMsg, BUTTON_TYPE_OK);
  const actions = [proceed];
  if (!isOnFailure && !databaseSanityStatus.isDBIncompatibilityExpected) {
    const cancel = new FollowUp({
      type: STATE_DB_HEAL_CANCEL,
    }, 'Cancel', BUTTON_TYPE_CANCEL);
    actions.push(cancel);
  }
  return new ConfirmationAlert(dbHealNotification, actions, false, title, false);
};

export default connect(
  state => ({
    sanityStatus: state.sanityCheckReducer.databaseSanityStatus,
    isPerformDBCleanup: state.sanityCheckReducer.isPerformDBCleanup,
    isDBCleanupInProgress: state.sanityCheckReducer.isDBCleanupInProgress,
    isCancelDBCleanup: state.sanityCheckReducer.isCancelDBCleanup,
    isDBCleanupCompleted: state.sanityCheckReducer.isDBCleanupCompleted,
    isDBFailureMsgViewed: state.sanityCheckReducer.isDBFailureMsgViewed,
  }),
  dispatch => ({
    onDBHealingConfirmationAlert: (databaseSanityStatus, isOnFailure) =>
      dispatch(addConfirmationAlert(dbHealingConfirmationAlert(databaseSanityStatus, isOnFailure)))
  })
)(Sanity);
