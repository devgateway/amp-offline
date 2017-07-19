/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import AFSection from './AFSection';
import { FUNDING } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../utils/constants/ValueConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';
import AFProjectCost from './funding/AFProjectCost';
import AFFundingDonorSection from './funding/AFFundingDonorSection';
import translate from '../../../../utils/translate';

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

  _getAcronym(sourceRole) {
    switch (sourceRole.value) {
      case VC.DONOR_AGENCY:
        return translate(AC.ACRONYM_DONOR_ORGANIZATION);
      case VC.BENEFICIARY_AGENCY:
        return translate(AC.ACRONYM_BENEFICIARY_AGENCY);
      case VC.IMPLEMENTING_AGENCY:
        return translate(AC.ACRONYM_IMPLEMENTING_AGENCY);
      case VC.EXECUTING_AGENCY:
        return translate(AC.ACRONYM_EXECUTING_AGENCY);
      case VC.RESPONSIBLE_ORGANIZATION:
        return translate(AC.ACRONYM_RESPONSIBLE_ORGANIZATION);
      default:
        return null;
    }
  }

  addFundingTabs() {
    if (this.props.activity.fundings) {
      // Group fundings for the same funding organization and role.
      const groups = [];
      this.props.activity.fundings.forEach(f => {
        if (!groups.find(i => (i[AC.FUNDING_DONOR_ORG_ID].id === f[AC.FUNDING_DONOR_ORG_ID].id
            && i[AC.SOURCE_ROLE].id === f[AC.SOURCE_ROLE].id))) {
          const acronym = this._getAcronym(f[AC.SOURCE_ROLE]);
          groups.push({
            [AC.FUNDING_DONOR_ORG_ID]: f[AC.FUNDING_DONOR_ORG_ID],
            [AC.SOURCE_ROLE]: f[AC.SOURCE_ROLE],
            acronym
          });
        }
        return groups;
      });
      return groups.map((funding) => (
        <Tab
          eventKey={funding[AC.FUNDING_DONOR_ORG_ID].id} key={funding[AC.FUNDING_DONOR_ORG_ID].id}
          title={`${funding[AC.FUNDING_DONOR_ORG_ID][AC.EXTRA_INFO][AC.ACRONYM]} (${funding.acronym})`}>
          <AFFundingDonorSection
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
    return (<Tabs defaultActiveKey={0} onSelect={this.handlePanelSelect} id="funding-tabs-container-tabs" >
      <Tab eventKey={0} title="Overview" key={0} >{this.generateOverviewTabContent()}</Tab>
      {this.addFundingTabs()}
    </Tabs>);
  }
}

export default AFSection(AFFunding, FUNDING);
