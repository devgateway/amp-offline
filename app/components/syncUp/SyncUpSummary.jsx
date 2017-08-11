import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import translate from '../../utils/translate';
import { createFormattedDateTime } from '../../utils/DateUtils';

const entry = (label, value) => (
  <div className="col-md-12">
    <strong>{label}</strong>
    &nbsp;
    {value}
  </div>
);

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
    const { status, timestamp } = data;
    return (
      <div className="container">
        {entry(translate('Status'), status)}
        {entry(translate('Started'), createFormattedDateTime(timestamp))}
        {entry(translate('Finished'), createFormattedDateTime(data['sync-date']))}
      </div>
    );
  }
}

export default SyncUpSummary;
