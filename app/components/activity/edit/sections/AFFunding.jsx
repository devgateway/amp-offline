import React, { Component, PropTypes } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import AFSection from './AFSection';
import { FUNDING } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';
import AFProjectCost from './funding/AFProjectCost';
import AFFundingDonorTab from './funding/AFFundingDonorTab';

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
      // Group fundings for the same funding organization and role.
      const groups = [];
      this.props.activity.fundings.map(f => {
        if (!groups.find(i => (i[AC.FUNDING_DONOR_ORG_ID].id === f[AC.FUNDING_DONOR_ORG_ID].id
          && i[AC.SOURCE_ROLE].id === f[AC.SOURCE_ROLE].id))) {
          // TODO: Display acronym for source role.
          groups.push({ [AC.FUNDING_DONOR_ORG_ID]: f[AC.FUNDING_DONOR_ORG_ID], [AC.SOURCE_ROLE]: f[AC.SOURCE_ROLE] });
        }
        return groups;
      });
      return groups.map((funding) => (
        <Tab
          eventKey={funding[AC.FUNDING_DONOR_ORG_ID].id} key={funding[AC.FUNDING_DONOR_ORG_ID].id}
          title={`${funding[AC.FUNDING_DONOR_ORG_ID][AC.EXTRA_INFO][AC.ACRONYM]} (${funding[AC.SOURCE_ROLE].value})`}>
          <AFFundingDonorTab
            fundings={this.props.activity.fundings}
            organization={funding[AC.FUNDING_DONOR_ORG_ID]}
            role={funding[AC.SOURCE_ROLE]}
          />
        </Tab>
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
    // TODO: remove this console.log
    console.log(this.props.activity);
    return (<Tabs defaultActiveKey={0} onSelect={this.handlePanelSelect} id="funding-tabs-container-tabs">
      <Tab eventKey={0} title="Overview" key={0}>{this.generateOverviewTabContent()}</Tab>
      {this.addFundingTabs()}
    </Tabs>);
  }
}

export default AFSection(AFFunding, FUNDING);
