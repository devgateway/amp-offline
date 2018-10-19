/* eslint-disable class-methods-use-this */
/* eslint-disable no-alert */
import React, { Component, PropTypes } from 'react';
import { Panel, Tab, Tabs } from 'react-bootstrap';
import AFSection from './AFSection';
import { FUNDING } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../utils/constants/ValueConstants';
import Logger from '../../../../modules/util/LoggerManager';
import AFProjectCost from './funding/AFProjectCost';
import AFFundingDonorSection from './funding/AFFundingDonorSection';
import translate from '../../../../utils/translate';
import AFFundingOrganizationSelect from './funding/components/AFFundingOrganizationSelect';
import FieldsManager from '../../../../modules/field/FieldsManager';
import styles from './funding/AFFunding.css';
import AFUtils from './../util/AFUtils';
import GlobalSettingsManager from '../../../../modules/util/GlobalSettingsManager';
import * as GSC from '../../../../utils/constants/GlobalSettingsConstants';

const logger = new Logger('AF funding');

/**
 * Funding Section
 * @author Nadejda Mandrescu
 */
class AFFunding extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.handleDonorSelect = this.handleDonorSelect.bind(this);
    this.removeFundingItem = this.removeFundingItem.bind(this);
    this.addFundingItem = this.addFundingItem.bind(this);
    this.handlePanelSelect = this.handlePanelSelect.bind(this);
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

  handleDonorSelect(values) {
    logger.debug('handleDonorSelect');
    if (values) {
      const value = (values instanceof Array) ? values[values.length - 1][AC.ORGANIZATION] : values;
      const fundingItem = AFUtils.createFundingItem(this.context.activityFieldsManager, value);
      // Needed for new activities or funding is not added.
      if (!this.context.activity[AC.FUNDINGS]) {
        this.context.activity[AC.FUNDINGS] = [];
      }
      this.context.activity[AC.FUNDINGS].push(fundingItem);
      this._addDonorToOrgRoleList(value.id, fundingItem[AC.SOURCE_ROLE]);
    }
  }

  /* Manually add the selected organization to activity.donor_organization or activity.execution_agency, etc
   (instead of activity.organization).
   NOTE: this will need more testing if we add the functionality to choose the org type + org. */
  _addDonorToOrgRoleList(donorId, role) {
    let sourceRolePath = '';
    const roleValue = role ? role.value : null;
    switch (roleValue) {
      case VC.DONOR_AGENCY:
        sourceRolePath = AC.DONOR_ORGANIZATION;
        break;
      case VC.BENEFICIARY_AGENCY:
        sourceRolePath = AC.BENEFICIARY_AGENCY;
        break;
      case VC.EXECUTING_AGENCY:
        sourceRolePath = AC.EXECUTING_AGENCY;
        break;
      case VC.CONTRACTING_AGENCY:
        sourceRolePath = AC.CONTRACTING_AGENCY;
        break;
      case VC.IMPLEMENTING_AGENCY:
        sourceRolePath = AC.IMPLEMENTING_AGENCY;
        break;
      case VC.RESPONSIBLE_ORGANIZATION:
        sourceRolePath = AC.RESPONSIBLE_ORGANIZATION;
        break;
      default:
        // This is the case when SOURCE_ROLE is disabled.
        sourceRolePath = AC.DONOR_ORGANIZATION;
        break;
    }
    if (!this.context.activity[sourceRolePath]) {
      // Initialize if necessary.
      this.context.activity[sourceRolePath] = [];
    }
    if (!this.context.activity[sourceRolePath].some(o => (o.organization.id === donorId))) {
      this.context.activity[sourceRolePath].push({ organization: { id: donorId } });
    }
  }

  addFundings() {
    if (this.context.activity[AC.FUNDINGS]) {
      // Group fundings for the same funding organization and role (if enabled).
      const groups = [];
      this.context.activity[AC.FUNDINGS].forEach(f => {
        // If source_role is disabled i[AC.SOURCE_ROLE] will be undefined so we ignore it.
        const tab = groups.find(i => (i[AC.FUNDING_DONOR_ORG_ID].id === f[AC.FUNDING_DONOR_ORG_ID].id
          && (i[AC.SOURCE_ROLE] === undefined || i[AC.SOURCE_ROLE].id === f[AC.SOURCE_ROLE].id)));
        // Look for errors on Commitments/Disbursements/Expenditures too.
        const errorsOnInternalSections = this.hasErrors(f[AC.FUNDING_DETAILS])
          || this.hasErrors(f[AC.MTEF_PROJECTIONS]);
        if (!tab) {
          const acronym = this._getAcronym(f[AC.SOURCE_ROLE]);
          groups.push({
            [AC.FUNDING_DONOR_ORG_ID]: f[AC.FUNDING_DONOR_ORG_ID],
            [AC.SOURCE_ROLE]: f[AC.SOURCE_ROLE],
            acronym,
            errors: (f.errors && f.errors.length > 0) || errorsOnInternalSections
          });
        } else {
          // We are grouping funding items into the same "Donor & Role" tab but one funding item can have
          // validation errors while the other doesnt so we have to keep that.
          tab.errors = tab.errors || (f.errors && f.errors.length > 0) || errorsOnInternalSections;
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
          if (GlobalSettingsManager.getSettingByKey(GSC.GS_FUNDING_SECTION_TAB_VIEW) === 'true') {
            return (<Tab
              eventKey={Math.random()} key={Math.random()}
              title={`${funding[AC.FUNDING_DONOR_ORG_ID][AC.EXTRA_INFO][AC.ACRONYM]} (${funding.acronym})`}
              tabClassName={funding.errors ? styles.error : ''}>
              <AFFundingDonorSection
                fundings={this.context.activity[AC.FUNDINGS] || []}
                organization={funding[AC.FUNDING_DONOR_ORG_ID]}
                role={sourceRole}
                removeFundingItem={this.removeFundingItem}
                addFundingItem={this.addFundingItem}
                hasErrors={this.hasErrors}
              />
            </Tab>);
          } else {
            return (<Panel
              key={Math.random()} collapsible
              header={<div className={funding.errors ? styles.error : ''}>
                {`${funding[AC.FUNDING_DONOR_ORG_ID][AC.VALUE]} (${funding[AC.SOURCE_ROLE].value})`}
              </div>}>
              <AFFundingDonorSection
                key={Math.random()}
                fundings={this.context.activity[AC.FUNDINGS] || []}
                organization={funding[AC.FUNDING_DONOR_ORG_ID]}
                role={sourceRole}
                removeFundingItem={this.removeFundingItem}
                addFundingItem={this.addFundingItem}
                hasErrors={this.hasErrors}
              />
            </Panel>);
          }
        });
    }
    return null;
  }

  removeFundingItem(addAutoFundingEnabledAndEmpty) {
    /* When there are no more fundings inside a tab and 'add funding automatically' feature is enabled we have to
      remove that tab. */
    if (addAutoFundingEnabledAndEmpty) {
      this.forceUpdate();
    }
  }

  addFundingItem() {
  }

  handlePanelSelect() {
  }

  generateOverviewTabContent() {
    return (<div>
      <AFProjectCost activity={this.context.activity} />
    </div>);
  }

  // Evaluate if a fundings section has errors.
  hasErrors(container) {
    if (container) {
      if (container instanceof Array) {
        let error = false;
        container.forEach(c => {
          // Only find the first error.
          if (!error) {
            error = this.hasErrors(c);
          }
        });
        return error;
      } else if (container.errors) {
        // TODO: Investigate why after a failed validation and then after the user has corrected the errors some errors
        // are duplicated on the list, one time with message and another without it.
        const withoutMessage = container.errors.filter(e => e.errorMessage === undefined);
        const withMessage = container.errors.filter(e => e.errorMessage);
        const difference = withMessage.filter(e => withoutMessage.filter(e2 => e2.path === e.path).length === 0);
        return difference.length > 0;
      }
    }
    return false;
  }

  render() {
    const overviewTabHasErrors = (this.context.activity[AC.PPC_AMOUNT]
      && this.context.activity[AC.PPC_AMOUNT][0]
      && this.context.activity[AC.PPC_AMOUNT][0].errors
      && this.context.activity[AC.PPC_AMOUNT][0].errors.length > 0);
    if (GlobalSettingsManager.getSettingByKey(GSC.GS_FUNDING_SECTION_TAB_VIEW) === 'true') {
      return (<div>
        <Tabs defaultActiveKey={0} onSelect={this.handlePanelSelect} id="funding-tabs-container-tabs">
          <Tab
            eventKey={0} title="Overview" key={0}
            tabClassName={overviewTabHasErrors ? styles.error : ''}>{this.generateOverviewTabContent()}</Tab>
          {this.addFundings()}
        </Tabs>
        <AFFundingOrganizationSelect activity={this.context.activity} handleDonorSelect={this.handleDonorSelect} />
      </div>);
    } else {
      return (
        <div>
          <div className={styles.overview_section}>{this.generateOverviewTabContent()}</div>
          <div>{this.addFundings()}</div>
          <AFFundingOrganizationSelect activity={this.context.activity} handleDonorSelect={this.handleDonorSelect} />
        </div>);
    }
  }
}

export default AFSection(AFFunding, FUNDING);
