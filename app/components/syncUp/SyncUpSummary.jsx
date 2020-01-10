import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ActivityConstants, Constants, UIUtils } from 'amp-ui';
import translate from '../../utils/translate';
import { createFormattedDateTime } from '../../utils/DateUtils';
import ErrorMessage from '../common/ErrorMessage';
import styles from './SyncUpSummary.css';
import SyncUpManager from '../../modules/syncup/SyncUpManager';
import { translateSyncStatus } from './tools';
import WarnMessage from '../common/WarnMessage';
import NotificationHelper from '../../modules/helpers/NotificationHelper';

class SyncUpSummary extends PureComponent {
  static propTypes = {
    data: PropTypes.object,
    errorMessage: PropTypes.string,
    forceSyncUp: PropTypes.bool
  };

  static listActivities(activities, source) {
    return activities.map((activity) => {
      const id = activity[ActivityConstants.AMP_ID];
      const { project_title: title } = activity;
      return (
        <div key={id || UIUtils.stringToId(title)}>
          [Source: {source}] {id} {title && `(${title})`}
        </div>
      );
    });
  }

  static deduplicateMessages(messages) {
    // messages should normally be deduplicated by SyncUpRunner._collectMessages,
    // however attempting here as well for possible: 1) historical data load  2) unexpected / new error sources
    const mSet = new Set();
    return messages.map(m => {
      m = NotificationHelper.tryAsNotification(m);
      const msg = m.message || m._message || m.toString();
      if (!mSet.has(msg)) {
        mSet.add(msg);
        return msg;
      }
      return null;
    }).filter(m => m);
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
        {errors && SyncUpSummary.deduplicateMessages(errors)
          .map(msg => <ErrorMessage key={UIUtils.stringToUniqueId(msg)} message={msg} />)}
        {warnings && SyncUpSummary.deduplicateMessages(warnings)
          .map(msg => <WarnMessage key={UIUtils.stringToUniqueId(msg)} message={msg} />)}
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
      const pulled = this.getActivitiesByType(Constants.SYNCUP_TYPE_ACTIVITIES_PULL);
      const pushed = this.getActivitiesByType(Constants.SYNCUP_TYPE_ACTIVITIES_PUSH);
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
        status: Constants.SYNCUP_STATUS_FAIL,
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
