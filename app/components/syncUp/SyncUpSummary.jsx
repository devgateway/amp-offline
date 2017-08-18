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

const safeGet = (obj, key, ...rest) => (rest.length && obj[key] ?
  safeGet(obj[key], rest) :
  obj[key]
);

const ensureArray = maybeArray => (Array.isArray(maybeArray) ? maybeArray : []);

class SyncUpSummary extends PureComponent {
  static propTypes = {
    history: PropTypes.array,
    activityTitles: PropTypes.array,
    params: PropTypes.shape({
      id: PropTypes.string
    }),
    getHistory: PropTypes.func.isRequired,
    getActivitiesNames: PropTypes.func.isRequired
  }

  componentDidMount() {
    const { getHistory, getActivitiesNames } = this.props;
    if (!this.maybeGetData()) {
      getHistory();
    } else {
      getActivitiesNames(this.getAllActivities());
    }
  }

  componentDidUpdate(prevProps) {
    if ((this.props.history.length && !prevProps.history.length) ||
        this.props.params.id !== prevProps.params.id) {
      const { getActivitiesNames } = this.props;
      getActivitiesNames(this.getAllActivities());
    }
  }

  getSuccessful() {
    const data = this.maybeGetData();
    return data.units.find(unit => unit.type === SYNCUP_TYPE_ACTIVITIES_PULL).pulled.concat(
      data.units.find(unit => unit.type === SYNCUP_TYPE_ACTIVITIES_PUSH).pushed
    );
  }

  getFailed() {
    const data = this.maybeGetData();
    return ensureArray(
      safeGet(data, 'syncup-diff-leftover', SYNCUP_TYPE_ACTIVITIES_PULL, 'saved')
    );
  }

  getAllActivities() {
    return this.getSuccessful().concat(this.getFailed());
  }

  maybeGetData() {
    const { history, params } = this.props;
    const { id } = params;
    if (!history.length) return null;
    return id ?
      history.find(syncObj => syncObj.id === +params.id) :
      history.reduce((a, b) => (b.id > a.id ? b : a));
  }

  render() {
    const { activityTitles } = this.props;
    const data = this.maybeGetData();
    if (!data) return null;
    const { status, timestamp, errors } = data;
    const successful = this.getSuccessful();
    const failed = this.getFailed();
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
        {<div className="row">
          <div className="col-md-4 text-right">
            <strong>{translate('Synced projects')}</strong>
          </div>
          <div className="col-md-8">
            {successful.length ? successful.map(id =>
              <div key={id}>{activityTitles[id]}</div>
            ) : translate('None')}
          </div>
        </div>
        }
        {<div className="row">
          <div className="col-md-4 text-right">
            <strong>{translate('Failed projects')}</strong>
          </div>
          <div className="col-md-8">
            {failed.length ? failed.map(id =>
              <div key={id}>{activityTitles[id]}</div>
            ) : translate('None')}
          </div>
        </div>
        }
      </div>
    );
  }
}

export default SyncUpSummary;
