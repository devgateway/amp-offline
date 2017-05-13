import React, { Component, PropTypes } from 'react';
import Section from '../Section';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import APFundingOrganizationSection from './APFundingOrganizationSection';

/**
 * Total Number of Fundings section
 * @author Gabriel Inchauspe
 */
class APFundingSection extends Component {

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    const fundingList = [];
    this.props.activity.fundings.forEach((funding) => {
      const item = <APFundingOrganizationSection funding={funding} />;
      fundingList.push(item);
    });
    return <div>{fundingList}</div>; // TODO: Add the totals section here.
  }
}

export default Section(APFundingSection, 'Funding');
