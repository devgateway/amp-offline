import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import translate from '../../utils/translate';
import { createFormattedDateTime } from '../../utils/DateUtils';
import {
  SYNCUP_STATUS_FAIL,
  SYNCUP_TYPE_ACTIVITIES_PULL,
  SYNCUP_TYPE_ACTIVITIES_PUSH
} from '../../utils/Constants';
import ErrorMessage from '../common/ErrorMessage';
import styles from './SyncUpSummary.css';
import { AMP_ID } from '../../utils/constants/ActivityConstants';
import Utils from '../../utils/Utils';
import SyncUpManager from '../../modules/syncup/SyncUpManager';
import { translateSyncStatus } from './tools';
import WarnMessage from '../common/WarnMessage';

class SyncUpSummary extends PureComponent {
  static propTypes = {
    data: PropTypes.object,
    errorMessage: PropTypes.string,
    forceSyncUp: PropTypes.bool
  };

  static listActivities(activities, source) {
    return activities.map((activity) => {
      const id = activity[AMP_ID];
      const { project_title: title } = activity;
      return (
        <div key={id || Utils.stringToId(title)}>
          [Source: {source}] {id} {title && `(${title})`}
        </div>
      );
    });
  }

  static report({
    status,
    errors,
    warnings,
    dateStarted,
    dateFinished,
    syncedActivities,
    unsyncedActivities
  }) {
    return (
      <div>
        {errors.map(error => {
          let msg;
          if (error._message) {
            // can't check `error instanceof NotificationHelper` because
            // `error` is typeless since it's read from sync log json
            msg = error._message;
          } else {
            msg = error.toString();
          }
          return <ErrorMessage message={msg.toString()} />;
        })}
        {warnings && warnings.map(warning => {
          const msg = warning.toString();
          return <WarnMessage key={Utils.stringToUniqueId(msg)} message={msg} />;
        })}
        <div className="container">
          <div className="row">
            <div className={`col-md-4 text-right ${styles.section_title}`}>
              {translate('Status')}
            </div>
            <div className="col-md-8">
              {translateSyncStatus(status)}
            </div>
          </div>
          <div className="row">
            <div className={`col-md-4 text-right ${styles.section_title}`}>
              {translate('Started')}
            </div>
            <div className="col-md-8">
              {dateStarted}
            </div>
          </div>
          <div className="row">
            <div className={`col-md-4 text-right ${styles.section_title}`}>
              {translate('Finished')}
            </div>
            <div className="col-md-8">
              {dateFinished}
            </div>
          </div>
          <div className="row">
            <div className={`col-md-4 text-right ${styles.section_title}`}>
              {translate('Synced projects')}
            </div>
            <div className="col-md-8">
              {syncedActivities}
            </div>
          </div>
          <div className="row">
            <div className={`col-md-4 text-right ${styles.section_title}`}>
              {translate('Failed projects')}
            </div>
            <div className="col-md-8">
              {unsyncedActivities}
            </div>
          </div>
        </div>
      </div>
    );
  }

  getActivitiesByType(type) {
    const { details } = this.props.data.units.find(
      unit => unit.type === type
    );

    return {
      synced: details.synced || [],
      unsynced: details.unsynced || []
    };
  }

  render() {
    const { data, errorMessage, forceSyncUp } = this.props;
    const forceSyncUpError = forceSyncUp ? SyncUpManager.getSyncUpStatusMessage() : null;
    if (data) {
      const { status, errors, warnings, dateStarted } = data;
      const { listActivities } = this.constructor;
      const fallbackToNone = arr => (arr.length ? arr : translate('None'));
      const pulled = this.getActivitiesByType(SYNCUP_TYPE_ACTIVITIES_PULL);
      const pushed = this.getActivitiesByType(SYNCUP_TYPE_ACTIVITIES_PUSH);
      if (forceSyncUpError) {
        errors.push(forceSyncUpError);
      }
      return this.constructor.report({
        status,
        errors,
        warnings,
        dateStarted: createFormattedDateTime(dateStarted),
        dateFinished: createFormattedDateTime(data['sync-date']),
        syncedActivities: fallbackToNone(
          listActivities(pushed.synced, translate('amp-offline')).concat(
          listActivities(pulled.synced, translate('AMP')))),
        unsyncedActivities: fallbackToNone(
          listActivities(pushed.unsynced, translate('amp-offline')).concat(
          listActivities(pulled.unsynced, translate('AMP'))))
      });
    } else if (errorMessage) {
      return this.constructor.report({
        status: SYNCUP_STATUS_FAIL,
        errors: forceSyncUpError ? [errorMessage, forceSyncUpError] : [errorMessage],
        dateStarted: 'n/a',
        dateFinished: 'n/a',
        syncedActivities: 'n/a',
        unsyncedActivities: 'n/a'
      });
    }
    return null;
  }
}

export default SyncUpSummary;
