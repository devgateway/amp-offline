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

class SyncUpSummary extends PureComponent {
  static propTypes = {
    history: PropTypes.array,
    params: PropTypes.shape({
      id: PropTypes.string
    }),
    getHistory: PropTypes.func.isRequired
  }

  maybeGetData (){
    const { history, params } = this.props;
    const { id } = params;
    return id ?
      history.find(syncObj => syncObj.id === +params.id) :
      history.reduce((a, b) => b.id > a.id ? b : a);
  }

  componentDidMount() {
    const { getHistory } = this.props;
    if (!this.maybeGetData()) getHistory();
  }

  render() {
    const data = this.maybeGetData();
    if (!data) return null;
    const { status, timestamp, errors } = data;
    const pulled = data.units.find(unit => unit.type === SYNCUP_TYPE_ACTIVITIES_PULL).pulled;
    const pushed = data.units.find(unit => unit.type === SYNCUP_TYPE_ACTIVITIES_PUSH).pushed;
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
        {pulled.length && <div className="row">
            <div className="col-md-4 text-right">
              <strong>{translate('Pulled activities')}</strong>
            </div>
            <div className="col-md-8">
              {pulled.map(id =>
                <div key={id}>{id}</div>)
              }
            </div>
          </div>
        }
        {pushed.length && <div className="row">
            <div className="col-md-4 text-right">
              <strong>{translate('Pushed activities')}</strong>
            </div>
            <div className="col-md-8">
              {pushed.map(id =>
                <div key={id}>{id}</div>)
              }
            </div>
          </div>
        }
      </div>
    );
  }
}

export default SyncUpSummary;
