/* eslint-disable class-methods-use-this */
/* eslint-disable no-alert */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Panel, Tab, Tabs } from 'react-bootstrap';
import AFSection from './AFSection';
import { FUNDING } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../utils/constants/ValueConstants';
import * as FPC from '../../../../utils/constants/FieldPathConstants';
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
    activity: PropTypes.object.isRequired,
    activityFundingSectionPanelStatus: PropTypes.array.isRequired
  };

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.handleDonorSelect = this.handleDonorSelect.bind(this);
    this.removeFundingItem = this.removeFundingItem.bind(this);
    this.addFundingItem = this.addFundingItem.bind(this);
    this.hasErrors = this.hasErrors.bind(this);
    this._refreshAfterChildChanges = this._refreshAfterChildChanges.bind(this);
    this._tabSelect = this._tabSelect.bind(this);
    this.state = { activeTab: 0, refresh: 0 };
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

  _tabSelect(index) {
    this.setState({ activeTab: index });
  }

  _refreshAfterChildChanges() {
    this.forceUpdate();
  }

  handleDonorSelect(values) {
    logger.debug('handleDonorSelect');
    if (values) {
      const value = (values instanceof Array) ? values[values.length - 1][AC.ORGANIZATION] : values;
      const fundingItem = AFUtils.createFundingItem(this.context.activityFieldsManager, value, VC.DONOR_AGENCY);
      // Needed for new activities or funding is not added.
      if (!this.context.activity[AC.FUNDINGS]) {
        this.context.activity[AC.FUNDINGS] = [];
      }
      this.context.activity[AC.FUNDINGS].push(fundingItem);
      this._addDonorToOrgRoleList(value.id, fundingItem[AC.SOURCE_ROLE]);
      this.forceUpdate();
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

  addDonorOrgs() {
    if (this.context.activity[AC.FUNDINGS]) {
      // Group fundings for the same funding organization and role (if enabled).
      const groups = [];
      this.context.activity[AC.FUNDINGS].forEach(f => {
        // If source_role is disabled i[AC.SOURCE_ROLE] will be undefined so we ignore it.
        const tab = groups.find(i => (i[AC.FUNDING_DONOR_ORG_ID].id === f[AC.FUNDING_DONOR_ORG_ID].id
          && (i[AC.SOURCE_ROLE] === undefined || i[AC.SOURCE_ROLE].id === f[AC.SOURCE_ROLE].id)));
        // Look for errors on Commitments/Disbursements/Expenditures too.
        const errorsOnInternalSections = FPC.TRANSACTION_TYPES.some(tt => this.hasErrors(f[tt]))
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
      let tabIndex = 0;
      return groups.sort((i, j) => (i[AC.FUNDING_DONOR_ORG_ID].value > j[AC.FUNDING_DONOR_ORG_ID].value))
        .map((funding) => {
          tabIndex += 1;
          // If source_role is disabled then the role is always "Donor".
          let sourceRole;
          if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.FUNDINGS}~${AC.SOURCE_ROLE}`)) {
            sourceRole = funding[AC.SOURCE_ROLE];
          } else {
            const enabledTrnType = FPC.TRANSACTION_TYPES
              .find(tt => this.context.activityFieldsManager.isFieldPathByPartsEnabled(AC.FUNDINGS, tt));
            const options = this.context.activityFieldsManager
              .possibleValuesMap[`${AC.FUNDINGS}~${enabledTrnType}~${AC.RECIPIENT_ROLE}`];
            sourceRole = Object.values(options).find(i => (i.value === VC.DONOR_AGENCY));
          }

          if (!this.context.activityFundingSectionPanelStatus.find(i =>
            i[AC.FUNDING_DONOR_ORG_ID].id === funding[AC.FUNDING_DONOR_ORG_ID].id
            && i[AC.SOURCE_ROLE].id === funding[AC.SOURCE_ROLE].id)) {
            this.context.activityFundingSectionPanelStatus.push({
              [AC.FUNDING_DONOR_ORG_ID]: funding[AC.FUNDING_DONOR_ORG_ID],
              [AC.SOURCE_ROLE]: funding[AC.SOURCE_ROLE],
              open: true,
              forceClose: false
            });
          }

          if (GlobalSettingsManager.getSettingByKey(GSC.GS_FUNDING_SECTION_TAB_VIEW) === 'true') {
            return (<Tab
              eventKey={tabIndex} key={Math.random()}
              title={`${funding[AC.FUNDING_DONOR_ORG_ID][AC.EXTRA_INFO][AC.ACRONYM]} (${funding.acronym})`}
              tabClassName={funding.errors ? styles.error : ''}>
              <AFFundingDonorSection
                fundings={this.context.activity[AC.FUNDINGS] || []}
                organization={funding[AC.FUNDING_DONOR_ORG_ID]}
                role={sourceRole}
                removeFundingItem={this.removeFundingItem}
                addFundingItem={this.addFundingItem}
                hasErrors={this.hasErrors}
                refreshAfterChildChanges={this._refreshAfterChildChanges}
                tabIndex={tabIndex}
              />
            </Tab>);
          } else {
            const group = this.context.activityFundingSectionPanelStatus.find(i =>
              i[AC.FUNDING_DONOR_ORG_ID].id === funding[AC.FUNDING_DONOR_ORG_ID].id
              && i[AC.SOURCE_ROLE].id === funding[AC.SOURCE_ROLE].id);
            let open = group.open;
            if (funding.errors && !group.forceClose) {
              open = true;
            }
            group.forceClose = false;
            return (<Panel
              key={Math.random()} collapsible expanded={open}
              onSelect={() => {
                group.open = !open;
                group.forceClose = open;
                this.setState({ refresh: Math.random() });
              }}
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
                refreshAfterChildChanges={this._refreshAfterChildChanges}
                tabIndex={tabIndex}
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

  /**
   * Here we render a container with amp_funding table info but grouped by donor and role with Tabs/Panels.
   * @returns {*}
   */
  render() {
    const ppc = this.context.activity[AC.PPC_AMOUNT];
    const overviewTabHasErrors = ppc && ppc.errors && ppc.errors.length;
    if (GlobalSettingsManager.getSettingByKey(GSC.GS_FUNDING_SECTION_TAB_VIEW) === 'true') {
      return (<div>
        <Tabs
          defaultActiveKey={0} onSelect={this._tabSelect} id="funding-tabs-container-tabs"
          activeKey={this.state.activeTab}>
          <Tab
            eventKey={0} title="Overview" key={0}
            tabClassName={overviewTabHasErrors ? styles.error : ''}>{this.generateOverviewTabContent()}</Tab>
          {this.addDonorOrgs()}
        </Tabs>
        <AFFundingOrganizationSelect activity={this.context.activity} handleDonorSelect={this.handleDonorSelect} />
      </div>);
    } else {
      return (
        <div>
          <div className={styles.overview_section}>{this.generateOverviewTabContent()}</div>
          <div>{this.addDonorOrgs()}</div>
          <AFFundingOrganizationSelect activity={this.context.activity} handleDonorSelect={this.handleDonorSelect} />
        </div>);
    }
  }
}

export default AFSection(AFFunding, FUNDING);
