import React, { Component, PropTypes } from 'react';
import Section from '../Section';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import APFundingOrganizationSection from './APFundingOrganizationSection';
import APFundingTotalsSection from './APFundingTotalsSection';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import styles from './APFundingSection.css';

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
    LoggerManager.log('render');
    const fundingList = [];
    this.props.activity.fundings.forEach((funding) => {
      const item = <APFundingOrganizationSection funding={funding} key={funding[AC.AMP_FUNDING_ID]} />;
      fundingList.push(item);
    });
    return (<div className={styles.container}>
      <div>{fundingList}</div>
      <div><APFundingTotalsSection fundings={this.props.activity.fundings} /></div>
    </div>);
  }
}

export default Section(APFundingSection, 'Funding');
