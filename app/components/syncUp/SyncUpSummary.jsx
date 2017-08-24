import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import translate from '../../utils/translate';
import { createFormattedDateTime } from '../../utils/DateUtils';
import {
  SYNCUP_STATUS_FAIL,
  SYNCUP_TYPE_ACTIVITIES_PULL
} from '../../utils/Constants';
import ErrorMessage from '../common/ErrorMessage';

class SyncUpSummary extends PureComponent {
  static propTypes = {
    data: PropTypes.object,
    getHistory: PropTypes.func.isRequired
  };

  static listActivities(activities) {
    if (Array.isArray(activities) && activities.length) {
      return activities.map(({ id, project_title: title }) =>
        <div key={id}>
          {id} {title && `(${title})`}
        </div>
      );
    } else {
      return translate('None');
    }
  }

  componentDidMount() {
    const { data, getHistory } = this.props;
    if (!data) getHistory();
  }

  render() {
    const { data } = this.props;
    if (!data) return null;
    const { timestamp, status, errors } = data;
    const details = data.units.find(unit => unit.type === SYNCUP_TYPE_ACTIVITIES_PULL).details;
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-4 text-right">
            <strong>{translate('Status')}</strong>
          </div>
          <div className="col-md-8">
            {status}
            {status === SYNCUP_STATUS_FAIL && errors.map(msg =>
              <ErrorMessage message={msg} />
            )}
          </div>
        </div>
        <div className="row">
          <div className="col-md-4 text-right">
            <strong>{translate('Started')}</strong>
          </div>
          <div className="col-md-8">
            {createFormattedDateTime(timestamp)}
          </div>
        </div>
        <div className="row">
          <div className="col-md-4 text-right">
            <strong>{translate('Finished')}</strong>
          </div>
          <div className="col-md-8">
            {createFormattedDateTime(data['sync-date'])}
          </div>
        </div>
        <div className="row">
          <div className="col-md-4 text-right">
            <strong>{translate('Synced projects')}</strong>
          </div>
          <div className="col-md-8">
            {this.constructor.listActivities(details.synced)}
          </div>
        </div>
        <div className="row">
          <div className="col-md-4 text-right">
            <strong>{translate('Failed projects')}</strong>
          </div>
          <div className="col-md-8">
            {this.constructor.listActivities(details.unsynced)}
          </div>
        </div>
      </div>
    );
  }
}

export default SyncUpSummary;
