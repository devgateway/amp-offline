import React, { Component, PropTypes } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import AFSection from './AFSection';
import { FUNDING } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';
import AFProjectCost from './funding/AFProjectCost';

/**
 * Funding Section
 * @author Nadejda Mandrescu
 */
class AFFunding extends Component {

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  addFundingTabs() {
    if (this.props.activity.fundings) {
      return this.props.activity.fundings.map((funding) => (
        <Tab
          eventKey={funding[AC.AMP_FUNDING_ID]}
          title={funding[AC.FUNDING_DONOR_ORG_ID][AC.EXTRA_INFO][AC.ACRONYM]}>Tab 2
          content</Tab>
      ));
    }
    return null;
  }

  generateOverviewTabContent() {
    return (<div>
      <AFProjectCost activity={this.props.activity} />
    </div>);
  }

  render() {
    return (<Tabs defaultActiveKey={0} onSelect={this.handleSelect} id="funding-tabs-container-tabs">
      <Tab eventKey={0} title="Overview">{this.generateOverviewTabContent()}</Tab>
      {this.addFundingTabs()}
    </Tabs>);
  }
}

export default AFSection(AFFunding, FUNDING);
