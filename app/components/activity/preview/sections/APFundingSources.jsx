import React, { Component, PropTypes } from 'react';
import Section from './Section';
import LoggerManager from '../../../../modules/util/LoggerManager';
import * as AC from '../../../../utils/constants/ActivityConstants';

/**
 * Total Number of Funding Sources section
 * @author Gabriel Inchauspe
 */
class APFundingSources extends Component {
  static propTypes = {
    buildSimpleField: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    const content = this.props.buildSimpleField(AC.TOTAL_NUMBER_OF_FUNDING_SOURCES, true, null, true);
    return (<div>{content}</div>);
  }
}

export default Section(APFundingSources, 'Funding Sources');
