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
    data: PropTypes.object,
    getHistory: PropTypes.func.isRequired
  }

  componentDidMount() {
    const { data, getHistory } = this.props;
    if (!data) getHistory();
  }

  render() {
    const { data } = this.props;
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
