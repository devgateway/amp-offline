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

class SyncUpSummary extends PureComponent {
  static propTypes = {
    data: PropTypes.object,
    errorMessage: PropTypes.string,
    forceSyncUp: PropTypes.bool
  };

  static listActivities(activities) {
    if (Array.isArray(activities) && activities.length) {
      return activities.map((activity) => {
        const id = activity[AMP_ID];
        const { project_title: title } = activity;
        return (
          <div key={id || Utils.stringToId(title)}>
            {id} {title && `(${title})`}
          </div>
        );
      }
      );
    } else {
      return translate('None');
    }
  }

  static report({
    status,
    errors,
    dateStarted,
    dateFinished,
    syncedActivities,
    unsyncedActivities
  }) {
    return (
      <div className="container">
        <div className="row">
          <div className={`col-md-4 text-right ${styles.section_title}`}>
            {translate('Status')}
          </div>
          <div className="col-md-8">
            {status}
            {status === SYNCUP_STATUS_FAIL && errors.map(msg =>
              <ErrorMessage message={msg.toString()} />
            )}
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
    );
  }

  render() {
    const { data, errorMessage, forceSyncUp } = this.props;
    const forceSyncUpError = forceSyncUp ? SyncUpManager.getSyncUpStatusMessage() : null;
    if (data) {
      const { status, errors, dateStarted } = data;
      const pulled = data.units.find(unit => unit.type === SYNCUP_TYPE_ACTIVITIES_PULL).details;
      const pushed = data.units.find(unit => unit.type === SYNCUP_TYPE_ACTIVITIES_PUSH).details;
      const synced = (pulled.synced || []).concat(pushed.synced || []);
      const unsynced = (pulled.unsynced || []).concat(pushed.unsynced || []);
      if (forceSyncUpError) {
        errors.push(forceSyncUpError);
      }
      return this.constructor.report({
        status,
        errors,
        dateStarted: createFormattedDateTime(dateStarted),
        dateFinished: createFormattedDateTime(data['sync-date']),
        syncedActivities: this.constructor.listActivities(synced),
        unsyncedActivities: this.constructor.listActivities(unsynced)
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
