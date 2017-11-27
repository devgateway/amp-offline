/* eslint-disable class-methods-use-this */
/* eslint-disable no-alert */
import React, { Component, PropTypes } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import AFSection from './AFSection';
import { FUNDING } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../utils/constants/ValueConstants';
import Logger from '../../../../modules/util/LoggerManager';
import AFProjectCost from './funding/AFProjectCost';
import AFFundingDonorSection from './funding/AFFundingDonorSection';
import translate from '../../../../utils/translate';
import AFFundingOrganizationSelect from './funding/components/AFFundingOrganizationSelect';
import Utils from '../../../../utils/Utils';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';

const logger = new Logger('AF funding');

/**
 * Funding Section
 * @author Nadejda Mandrescu
 */
class AFFunding extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired,
    activity: PropTypes.object.isRequired
  };

  static propTypes = {
    errors: PropTypes.array
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.state = {
      fundingList: []
    };
    this.handleDonorSelect = this.handleDonorSelect.bind(this);
    this.removeFundingItem = this.removeFundingItem.bind(this);
  }

  componentWillMount() {
    this.state = {
      fundingList: this.context.activity.fundings || []
    };
  }

  _getAcronym(sourceRole) {
    if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.FUNDINGS}~${AC.SOURCE_ROLE}`)) {
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
    } else {
      return translate(VC.ACRONYM_DONOR_ORGANIZATION);
    }
  }

  handleDonorSelect(value) {
    logger.debug('handleDonorSelect');
    if (value) {
      const fundingItem = {};
      fundingItem[AC.FUNDING_DONOR_ORG_ID] = {
        id: value._id,
        value: value._value,
        extra_info: value.extra_info,
        'translated-value': value['translated-value']
      };
      // Find the 'Donor' org type if enabled.
      if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.FUNDINGS}~${AC.SOURCE_ROLE}`)) {
        const donorList = this.context.activityFieldsManager.possibleValuesMap[`${AC.FUNDINGS}~${AC.SOURCE_ROLE}`];
        const donorOrg = Object.values(donorList).find(item => item.value === VC.DONOR_AGENCY);
        fundingItem[AC.SOURCE_ROLE] = donorOrg;
      }
      fundingItem[AC.FUNDING_DETAILS] = [];
      fundingItem[AC.GROUP_VERSIONED_FUNDING] = Utils.numberRandom();
      fundingItem[AC.AMP_FUNDING_ID] = Utils.numberRandom();
      const newFundingList = this.state.fundingList;
      newFundingList.push(fundingItem);
      this.setState({ fundingList: newFundingList });
      // Needed for new activities or funding is not added.
      this.context.activity.fundings = newFundingList;
    }
  }

  addFundingTabs() {
    if (this.state.fundingList) {
      // Group fundings for the same funding organization and role (if enabled).
      const groups = [];
      this.state.fundingList.forEach(f => {
        // If source_role is disabled i[AC.SOURCE_ROLE] will be undefined so we ignore it.
        if (!groups.find(i => (i[AC.FUNDING_DONOR_ORG_ID].id === f[AC.FUNDING_DONOR_ORG_ID].id
            && (i[AC.SOURCE_ROLE] === undefined || i[AC.SOURCE_ROLE].id === f[AC.SOURCE_ROLE].id)))) {
          const acronym = this._getAcronym(f[AC.SOURCE_ROLE]);
          groups.push({
            [AC.FUNDING_DONOR_ORG_ID]: f[AC.FUNDING_DONOR_ORG_ID],
            [AC.SOURCE_ROLE]: f[AC.SOURCE_ROLE],
            acronym
          });
        }
        return groups;
      });
      return groups.sort((i, j) => (i[AC.FUNDING_DONOR_ORG_ID].value > j[AC.FUNDING_DONOR_ORG_ID].value))
        .map((funding) => {
          // If source_role is disabled then the role is always "Donor".
          let sourceRole;
          if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.FUNDINGS}~${AC.SOURCE_ROLE}`)) {
            sourceRole = funding[AC.SOURCE_ROLE];
          } else {
            const options = this.context.activityFieldsManager
              .possibleValuesMap[`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.RECIPIENT_ROLE}`];
            sourceRole = Object.values(options).find(i => (i.value === VC.DONOR_AGENCY));
          }
          const fundingErrors = this.props.errors
            ? this.props.errors.filter(e => (e.path && e.path.startsWith(AC.FUNDINGS)))
            : [];
          return (<Tab
            eventKey={funding[AC.FUNDING_DONOR_ORG_ID].id} key={funding[AC.FUNDING_DONOR_ORG_ID].id}
            title={`${funding[AC.FUNDING_DONOR_ORG_ID][AC.EXTRA_INFO][AC.ACRONYM]} (${funding.acronym})`}>
            <AFFundingDonorSection
              fundings={this.state.fundingList}
              organization={funding[AC.FUNDING_DONOR_ORG_ID]}
              role={sourceRole}
              removeFundingItem={this.removeFundingItem}
              errors={fundingErrors}
            />
          </Tab>);
        });
    }
    return null;
  }

  removeFundingItem(id) {
    logger.log('_removeFundingItem');
    if (confirm(translate('deleteFundingItem'))) {
      const newFundingList = this.state.fundingList;
      const index = this.state.fundingList.findIndex((item) => (item[AC.GROUP_VERSIONED_FUNDING] === id));
      newFundingList.splice(index, 1);
      this.setState({ fundingList: newFundingList });
    }
  }

  generateOverviewTabContent() {
    return (<div>
      <AFProjectCost activity={this.context.activity} />
    </div>);
  }

  render() {
    return (<div>
      <Tabs defaultActiveKey={0} onSelect={this.handlePanelSelect} id="funding-tabs-container-tabs">
        <Tab eventKey={0} title="Overview" key={0}>{this.generateOverviewTabContent()}</Tab>
        {this.addFundingTabs()}
      </Tabs>
      <AFFundingOrganizationSelect activity={this.context.activity} handleDonorSelect={this.handleDonorSelect} />
    </div>);
  }
}

export default AFSection(AFFunding, FUNDING);
