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
import AFFundingOrganizationSelect from './funding/components/AFFundingOrganizationSelect';

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
    this.state = {
      fundingList: []
    };
    this.handleDonorSelect = this.handleDonorSelect.bind(this);
  }

  componentWillMount() {
    this.state = {
      fundingList: this.props.activity.fundings
    };
  }

  _getAcronym(sourceRole) {
    switch (sourceRole.value) {
      case VC.DONOR_AGENCY:
        return translate(VC.ACRONYM_DONOR_ORGANIZATION);
      case VC.BENEFICIARY_AGENCY:
        return translate(VC.ACRONYM_BENEFICIARY_AGENCY);
      case VC.IMPLEMENTING_AGENCY:
        return translate(VC.ACRONYM_IMPLEMENTING_AGENCY);
      case VC.EXECUTING_AGENCY:
        return translate(VC.ACRONYM_EXECUTING_AGENCY);
      case VC.RESPONSIBLE_ORGANIZATION:
        return translate(VC.ACRONYM_RESPONSIBLE_ORGANIZATION);
      default:
        return null;
    }
  }

  handleDonorSelect(value) {
    LoggerManager.log('handleDonorSelect');
    // TODO: ver si tengo q sacar el nuevo org de la tabla.
    const fundingItem = {};
    fundingItem[AC.FUNDING_DONOR_ORG_ID] = {
      id: value._id,
      value: value._value,
      extra_info: value.extra_info,
      'translated-value': value['translated-value']
    };
    // TODO: remove everything hardcoded.
    fundingItem[AC.SOURCE_ROLE] = { id: 1, value: 'Donor' };
    fundingItem[AC.FUNDING_DETAILS] = [];
    fundingItem[AC.GROUP_VERSIONED_FUNDING] = Math.trunc(Math.random() * 10000);
    fundingItem[AC.AMP_FUNDING_ID] = Math.trunc(Math.random() * 10000);
    const newFundingList = this.state.fundingList;
    newFundingList.push(fundingItem);
    this.setState({ fundingList: newFundingList });
  }

  addFundingTabs() {
    if (this.state.fundingList) {
      // Group fundings for the same funding organization and role.
      const groups = [];
      this.state.fundingList.forEach(f => {
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
            fundings={this.state.fundingList}
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
    return (<div>
      <Tabs defaultActiveKey={0} onSelect={this.handlePanelSelect} id="funding-tabs-container-tabs">
        <Tab eventKey={0} title="Overview" key={0}>{this.generateOverviewTabContent()}</Tab>
        {this.addFundingTabs()}
      </Tabs>
      <AFFundingOrganizationSelect activity={this.props.activity} handleDonorSelect={this.handleDonorSelect} />
    </div>);
  }
}

export default AFSection(AFFunding, FUNDING);
