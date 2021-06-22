/* eslint-disable class-methods-use-this */
/* eslint-disable no-alert */
/* eslint-disable max-len */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Panel, Tab, Tabs } from 'react-bootstrap';
import { ActivityConstants, ValueConstants, FieldPathConstants, FieldsManager, GlobalSettingsConstants } from 'amp-ui';
import AFSection from './AFSection';
import { FUNDING } from './AFSectionConstants';
import Logger from '../../../../modules/util/LoggerManager';
import AFProjectCost from './funding/AFProjectCost';
import AFFundingDonorSection from './funding/AFFundingDonorSection';
import translate from '../../../../utils/translate';
import AFFundingOrganizationSelect from './funding/components/AFFundingOrganizationSelect';
import styles from './funding/AFFunding.css';
import AFUtils from './../util/AFUtils';
import GlobalSettingsManager from '../../../../modules/util/GlobalSettingsManager';

const logger = new Logger('AF funding');

/**
 * Funding Section
 * @author Nadejda Mandrescu
 */
class AFFunding extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    activity: PropTypes.object.isRequired,
    activityFundingSectionPanelStatus: PropTypes.array.isRequired,
    workspaceReducer: PropTypes.object.isRequired
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
    this._tabSelect = this._tabSelect.bind(this);
    this.state = { activeTab: 0, refresh: 0 };
  }

  componentWillReceiveProps() {
    this.setState({ refresh: Math.random() });
  }

  _getAcronym(sourceRole) {
    if (this.context.activityFieldsManager.isFieldPathEnabled(
      `${ActivityConstants.FUNDINGS}~${ActivityConstants.SOURCE_ROLE}`)) {
      switch (sourceRole.value) {
        case ValueConstants.DONOR_AGENCY:
          return translate(ValueConstants.ACRONYM_DONOR_ORGANIZATION);
        case ValueConstants.BENEFICIARY_AGENCY:
          return translate(ValueConstants.ACRONYM_BENEFICIARY_AGENCY);
        case ValueConstants.IMPLEMENTING_AGENCY:
          return translate(ValueConstants.ACRONYM_IMPLEMENTING_AGENCY);
        case ValueConstants.EXECUTING_AGENCY:
          return translate(ValueConstants.ACRONYM_EXECUTING_AGENCY);
        case ValueConstants.RESPONSIBLE_ORGANIZATION:
          return translate(ValueConstants.ACRONYM_RESPONSIBLE_ORGANIZATION);
        default:
          return null;
      }
    } else {
      return translate(ValueConstants.ACRONYM_DONOR_ORGANIZATION);
    }
  }

  _tabSelect(index) {
    this.setState({ activeTab: index });
  }

  handleDonorSelect(values) {
    logger.debug('handleDonorSelect');
    if (values) {
      const value = (values instanceof Array) ? values[values.length - 1][ActivityConstants.ORGANIZATION] : values;
      const fundingItem = AFUtils.createFundingItem(this.context.activityFieldsManager, value, ValueConstants.DONOR_AGENCY);
      // Needed for new activities or funding is not added.
      if (!this.context.activity[ActivityConstants.FUNDINGS]) {
        this.context.activity[ActivityConstants.FUNDINGS] = [];
      }
      this.context.activity[ActivityConstants.FUNDINGS].push(fundingItem);
      this._addDonorToOrgRoleList(value.id, fundingItem[ActivityConstants.SOURCE_ROLE]);
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
      case ValueConstants.DONOR_AGENCY:
        sourceRolePath = ActivityConstants.DONOR_ORGANIZATION;
        break;
      case ValueConstants.BENEFICIARY_AGENCY:
        sourceRolePath = ActivityConstants.BENEFICIARY_AGENCY;
        break;
      case ValueConstants.EXECUTING_AGENCY:
        sourceRolePath = ActivityConstants.EXECUTING_AGENCY;
        break;
      case ValueConstants.CONTRACTING_AGENCY:
        sourceRolePath = ActivityConstants.CONTRACTING_AGENCY;
        break;
      case ValueConstants.IMPLEMENTING_AGENCY:
        sourceRolePath = ActivityConstants.IMPLEMENTING_AGENCY;
        break;
      case ValueConstants.RESPONSIBLE_ORGANIZATION:
        sourceRolePath = ActivityConstants.RESPONSIBLE_ORGANIZATION;
        break;
      default:
        // This is the case when SOURCE_ROLE is disabled.
        sourceRolePath = ActivityConstants.DONOR_ORGANIZATION;
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
    if (this.context.activity[ActivityConstants.FUNDINGS]) {
      // Group fundings for the same funding organization and role (if enabled).
      const groups = [];
      this.context.activity[ActivityConstants.FUNDINGS].forEach(f => {
        // If source_role is disabled i[ActivityConstants.SOURCE_ROLE] will be undefined so we ignore it.
        const tab = groups
          .find(i => (i[ActivityConstants.FUNDING_DONOR_ORG_ID].id === f[ActivityConstants.FUNDING_DONOR_ORG_ID].id
            && (i[ActivityConstants.SOURCE_ROLE] === undefined ||
              i[ActivityConstants.SOURCE_ROLE].id === f[ActivityConstants.SOURCE_ROLE].id)));
        // Look for errors on Commitments/Disbursements/Expenditures too.
        const errorsOnInternalSections = FieldPathConstants.TRANSACTION_TYPES.some(tt => this.hasErrors(f[tt]))
          || this.hasErrors(f[ActivityConstants.MTEF_PROJECTIONS]);
        if (!tab) {
          const acronym = this._getAcronym(f[ActivityConstants.SOURCE_ROLE]);
          groups.push({
            [ActivityConstants.FUNDING_DONOR_ORG_ID]: f[ActivityConstants.FUNDING_DONOR_ORG_ID],
            [ActivityConstants.SOURCE_ROLE]: f[ActivityConstants.SOURCE_ROLE],
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
      return groups.sort((i, j) =>
        (i[ActivityConstants.FUNDING_DONOR_ORG_ID].value > j[ActivityConstants.FUNDING_DONOR_ORG_ID].value))
        .map((funding) => {
          tabIndex += 1;
          // If source_role is disabled then the role is always "Donor".
          let sourceRole;
          if (this.context.activityFieldsManager.isFieldPathEnabled(
            `${ActivityConstants.FUNDINGS}~${ActivityConstants.SOURCE_ROLE}`)) {
            sourceRole = funding[ActivityConstants.SOURCE_ROLE];
          } else {
            const enabledTrnType = FieldPathConstants.TRANSACTION_TYPES
              .find(tt => this.context.activityFieldsManager.isFieldPathByPartsEnabled(ActivityConstants.FUNDINGS, tt));
            const options = this.context.activityFieldsManager
              .possibleValuesMap[`${ActivityConstants.FUNDINGS}~${enabledTrnType}~${ActivityConstants.RECIPIENT_ROLE}`];
            sourceRole = Object.values(options).find(i => (i.value === ValueConstants.DONOR_AGENCY));
          }

          if (!this.context.activityFundingSectionPanelStatus.find(i =>
            i[ActivityConstants.FUNDING_DONOR_ORG_ID].id === funding[ActivityConstants.FUNDING_DONOR_ORG_ID].id
            && i[ActivityConstants.SOURCE_ROLE].id === funding[ActivityConstants.SOURCE_ROLE].id)) {
            this.context.activityFundingSectionPanelStatus.push({
              [ActivityConstants.FUNDING_DONOR_ORG_ID]: funding[ActivityConstants.FUNDING_DONOR_ORG_ID],
              [ActivityConstants.SOURCE_ROLE]: funding[ActivityConstants.SOURCE_ROLE],
              open: true,
              forceClose: false
            });
          }

          if (GlobalSettingsManager.getSettingByKey(GlobalSettingsConstants.GS_FUNDING_SECTION_TAB_VIEW) === 'true') {
            return (<Tab
              eventKey={tabIndex} key={Math.random()}
              title={`${funding[ActivityConstants.FUNDING_DONOR_ORG_ID][ActivityConstants.EXTRA_INFO][ActivityConstants.ACRONYM]} (${funding.acronym})`}
              tabClassName={funding.errors ? styles.error : ''}>
              <AFFundingDonorSection
                fundings={this.context.activity[ActivityConstants.FUNDINGS] || []}
                organization={funding[ActivityConstants.FUNDING_DONOR_ORG_ID]}
                role={sourceRole}
                removeFundingItem={this.removeFundingItem}
                addFundingItem={this.addFundingItem}
                hasErrors={this.hasErrors}
                tabIndex={tabIndex}
              />
            </Tab>);
          } else {
            const group = this.context.activityFundingSectionPanelStatus.find(i =>
              i[ActivityConstants.FUNDING_DONOR_ORG_ID].id === funding[ActivityConstants.FUNDING_DONOR_ORG_ID].id
              && i[ActivityConstants.SOURCE_ROLE].id === funding[ActivityConstants.SOURCE_ROLE].id);
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
                {`${funding[ActivityConstants.FUNDING_DONOR_ORG_ID][ActivityConstants.VALUE]} (${funding[ActivityConstants.SOURCE_ROLE].value})`}
              </div>}>
              <AFFundingDonorSection
                key={Math.random()}
                fundings={this.context.activity[ActivityConstants.FUNDINGS] || []}
                organization={funding[ActivityConstants.FUNDING_DONOR_ORG_ID]}
                role={sourceRole}
                removeFundingItem={this.removeFundingItem}
                addFundingItem={this.addFundingItem}
                hasErrors={this.hasErrors}
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
    const ppc = this.context.activity[ActivityConstants.PPC_AMOUNT];
    const overviewTabHasErrors = ppc && ppc.errors && ppc.errors.length;
    if (GlobalSettingsManager.getSettingByKey(GlobalSettingsConstants.GS_FUNDING_SECTION_TAB_VIEW) === 'true') {
      return (<div>
        <Tabs
          defaultActiveKey={0} onSelect={this._tabSelect} id="funding-tabs-container-tabs"
          activeKey={this.state.activeTab}>
          <Tab
            eventKey={0} title="Overview" key={0}
            tabClassName={overviewTabHasErrors ? styles.error : ''}>{this.generateOverviewTabContent()}</Tab>
          {this.addDonorOrgs()}
        </Tabs>
        <AFFundingOrganizationSelect
          activity={this.context.activity} handleDonorSelect={this.handleDonorSelect}
          workspaceReducer={this.context.workspaceReducer} />
      </div>);
    } else {
      return (
        <div>
          <div className={styles.overview_section}>{this.generateOverviewTabContent()}</div>
          <div>{this.addDonorOrgs()}</div>
          <AFFundingOrganizationSelect
            activity={this.context.activity} handleDonorSelect={this.handleDonorSelect}
            workspaceReducer={this.context.workspaceReducer} />
        </div>);
    }
  }
}

export default AFSection(AFFunding, FUNDING);
