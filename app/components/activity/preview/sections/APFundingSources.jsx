import React, { Component, PropTypes } from 'react';
import Section from './Section';
import LoggerManager from '../../../../modules/util/LoggerManager';
import NumberUtils from '../../../../utils/NumberUtils';
import translate from '../../../../utils/translate';

/**
 * Total Number of Funding Sources section
 * @author Gabriel Inchauspe
 */
class APFundingSources extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    const numberOfFundingSources = this.props.activity.total_number_of_funding_sources
      ? NumberUtils.rawNumberToFormattedString(this.props.activity.total_number_of_funding_sources)
      : '';
    return <div>{translate('Funding Sources')} <b>{numberOfFundingSources}</b></div>;
  }
}

export default Section(APFundingSources, 'Total Number of Funding Sources');
