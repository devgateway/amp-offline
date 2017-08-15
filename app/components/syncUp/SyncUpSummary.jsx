import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import translate from '../../utils/translate';
import { createFormattedDateTime } from '../../utils/DateUtils';
import {SYNCUP_STATUS_FAIL} from '../../utils/Constants';
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
    return history.find(syncObj => syncObj.id === +params.id);
  }

  componentDidMount() {
    const { getHistory } = this.props;
    if (!this.maybeGetData()) getHistory();
  }

  render() {
    const data = this.maybeGetData();
    if (!data) return null;
    const { status, timestamp, errors } = data;
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
      </div>
    );
  }
}

export default SyncUpSummary;
