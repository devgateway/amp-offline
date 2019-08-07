import React, { Component, PropTypes } from 'react';
import { ActivityConstants } from 'amp-ui';
import Section from './Section';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AP funding sources');

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
    logger.log('constructor');
  }

  render() {
    const content = this.props.buildSimpleField(ActivityConstants.TOTAL_NUMBER_OF_FUNDING_SOURCES, true, null, true);
    return (<div>{content}</div>);
  }
}

export default Section(APFundingSources, 'Funding Sources', true, 'APFundingSources');
