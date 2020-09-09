/* eslint-disable max-len */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, FormControl, FormGroup, Grid, HelpBlock, Row } from 'react-bootstrap';
import { ActivityConstants, FeatureManagerConstants, ValueConstants, FieldPathConstants, FieldsManager,
WorkspaceConstants } from 'amp-ui';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import BudgetCode from './organization/BudgetCode';
import { ORGANIZATIONS } from './AFSectionConstants';
import Logger from '../../../../modules/util/LoggerManager';
import afStyles from '../ActivityForm.css';
import AFOption from '../components/AFOption';
import AFUtils from './../util/AFUtils';
import translate from '../../../../utils/translate';

const logger = new Logger('AF organizations');

export const orgFormatter = (org: AFOption) => {
  const acronym = org[ActivityConstants.EXTRA_INFO][ActivityConstants.ACRONYM] ?
    org[ActivityConstants.EXTRA_INFO][ActivityConstants.ACRONYM].trim() : '';
  const value = `${org.translatedValue.trim()}`;
  if (acronym !== '') {
    return `(${acronym}) - ${value}`;
  }
  return value;
};

/**
 * Organizations Section
 * @author Nadejda Mandrescu
 */
class AFOrganizations extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    workspaceReducer: PropTypes.object.isRequired
  };

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.setState({ validationError: undefined });
    this.handleOrgListChange = this.handleOrgListChange.bind(this);
    this.checkValidationError = this.checkValidationError.bind(this);
    this.addFundingAutomatically = this.addFundingAutomatically.bind(this);
  }

  /**
   * This a link to general organization dependencies validation error processing
   * @return {undefined}
   */
  getValidationError() {
    const { activity } = this.props;
    let dependencyErrors;
    // TODO AMPOFFLINE-456 remove components dependency errors reporting from here once AF components are implemented
    if (activity[ActivityConstants.COMPONENTS] && activity[ActivityConstants.COMPONENTS].length) {
      const compFundOrgPath = `${ActivityConstants.COMPONENTS}~${ActivityConstants.COMPONENT_FUNDING}~${ActivityConstants.COMPONENT_ORGANIZATION}`;
      const compOrgsErrors = [];
      activity[ActivityConstants.COMPONENTS].forEach(component => {
        const compFunding = component[ActivityConstants.COMPONENT_FUNDING];
        if (compFunding && compFunding.length) {
          compFunding.filter(cF => cF.errors && cF.errors.length).forEach(cF => {
            compOrgsErrors.push(...cF.errors.filter(e => e.path === compFundOrgPath).map(e => e.errorMessage));
          });
        }
      });
      const uniqueErrors = new Set(compOrgsErrors);
      dependencyErrors = uniqueErrors.size ? [...uniqueErrors].join('. ') : null;
    }
    return dependencyErrors;
  }

  checkValidationError() {
    const validationError = this.getValidationError();
    this.setState({ validationError });
  }

  addFundingAutomatically(orgTypeCode, orgTypeName) {
    if (AFUtils.checkIfAutoAddFundingEnabled(orgTypeCode)) {
      const { activity } = this.props;
      const { activityFieldsManager } = this.context;
      const fundingList = activity[ActivityConstants.FUNDINGS] || [];
      activity[orgTypeCode].forEach(org => {
        const fundingFound = AFUtils.checkIfOrganizationAndOrgTypeHasFunding(orgTypeName, org[ActivityConstants.ORGANIZATION],
          this.context.activityFieldsManager, activity);
        if (!fundingFound) {
          const fundingItem = AFUtils.createFundingItem(activityFieldsManager, org[ActivityConstants.ORGANIZATION],
            orgTypeName);
          fundingList.push(fundingItem);
          activity[ActivityConstants.FUNDINGS] = fundingList;
        }
      });
    }
  }

  handleOrgListChange(orgTypeCode, orgCodeName) {
    this.addFundingAutomatically(orgTypeCode, orgCodeName);
    this.checkValidationError();
  }

  checkIfCanDeleteOrg(orgTypeCode, orgTypeName, organization) {
    let canDelete = true;
    const { activity } = this.props;
    if (AFUtils.checkIfAutoAddFundingEnabled(orgTypeCode)
      && AFUtils.checkIfOrganizationAndOrgTypeHasFunding(orgTypeName, organization[ActivityConstants.ORGANIZATION],
        this.context.activityFieldsManager, activity)) {
      alert(translate('fundingRelated'));
      canDelete = false;
    }
    return canDelete;
  }

  orgFilterForTemplate() {
    const { workspaceReducer } = this.context;
    if (workspaceReducer.currentWorkspace[WorkspaceConstants.TEMPLATE_ID]) {
      return [{ path: 'template', value: workspaceReducer.currentWorkspace[WorkspaceConstants.TEMPLATE_ID] }];
    }
    return null;
  }

  render() {
    const validationError = this.getValidationError();
    const validationStyle = `${afStyles.activity_form_control} ${afStyles.help_block}`;
    const extraParams = { afOptionFormatter: orgFormatter, sortByDisplayValue: true };
    return (<div className={afStyles.full_width}>
      <Grid className={afStyles.full_width}>
        <Row>
          <Col md={12} lg={12}>
            <FormGroup controlId={ActivityConstants.ORGANIZATION} validationState={validationError ? 'error' : null}>
              <FormControl.Feedback />
              <HelpBlock className={validationStyle}>{validationError}</HelpBlock>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity}
              fieldPath={ActivityConstants.DONOR_ORGANIZATION} extraParams={extraParams}
              fmPath={FeatureManagerConstants.ACTIVITY_ORGANIZATIONS_DONOR_ORGANIZATION}
              onBeforeDelete={this.checkIfCanDeleteOrg.bind(this, ActivityConstants.DONOR_ORGANIZATION, ValueConstants.DONOR_AGENCY)}
              onAfterUpdate={this.handleOrgListChange.bind(null, ActivityConstants.DONOR_ORGANIZATION, ValueConstants.DONOR_AGENCY)}
              filter={this.orgFilterForTemplate()}
            />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity} fieldPath={ActivityConstants.RESPONSIBLE_ORGANIZATION}
              extraParams={{
                custom: {
                  [FieldPathConstants.RESPONSIBLE_ORGANIZATION_BUDGETS_PATH]: BudgetCode(FieldPathConstants.RESPONSIBLE_ORGANIZATION_BUDGETS_PATH)
                },
                ...extraParams
              }}
              onBeforeDelete={this.checkIfCanDeleteOrg.bind(this, ActivityConstants.RESPONSIBLE_ORGANIZATION,
                ValueConstants.RESPONSIBLE_ORGANIZATION)}
              onAfterUpdate={this.handleOrgListChange.bind(null, ActivityConstants.RESPONSIBLE_ORGANIZATION,
                ValueConstants.RESPONSIBLE_ORGANIZATION)} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity} fieldPath={ActivityConstants.EXECUTING_AGENCY}
              extraParams={extraParams}
              onBeforeDelete={this.checkIfCanDeleteOrg.bind(this, ActivityConstants.EXECUTING_AGENCY, ValueConstants.EXECUTING_AGENCY)}
              onAfterUpdate={this.handleOrgListChange.bind(null, ActivityConstants.EXECUTING_AGENCY, ValueConstants.EXECUTING_AGENCY)}
              filter={this.orgFilterForTemplate()} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity} fieldPath={ActivityConstants.IMPLEMENTING_AGENCY} extraParams={extraParams}
              onBeforeDelete={this.checkIfCanDeleteOrg.bind(this, ActivityConstants.IMPLEMENTING_AGENCY, ValueConstants.IMPLEMENTING_AGENCY)}
              onAfterUpdate={this.handleOrgListChange.bind(null, ActivityConstants.IMPLEMENTING_AGENCY, ValueConstants.IMPLEMENTING_AGENCY)} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity} fieldPath={ActivityConstants.BENEFICIARY_AGENCY} extraParams={extraParams}
              onBeforeDelete={this.checkIfCanDeleteOrg.bind(this, ActivityConstants.BENEFICIARY_AGENCY, ValueConstants.BENEFICIARY_AGENCY)}
              onAfterUpdate={this.handleOrgListChange.bind(null, ActivityConstants.BENEFICIARY_AGENCY, ValueConstants.BENEFICIARY_AGENCY)}
              filter={this.orgFilterForTemplate()} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity} fieldPath={ActivityConstants.CONTRACTING_AGENCY} extraParams={extraParams}
              onBeforeDelete={this.checkIfCanDeleteOrg.bind(this, ActivityConstants.CONTRACTING_AGENCY, ValueConstants.CONTRACTING_AGENCY)}
              onAfterUpdate={this.handleOrgListChange.bind(null, ActivityConstants.CONTRACTING_AGENCY, ValueConstants.CONTRACTING_AGENCY)} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity} fieldPath={ActivityConstants.REGIONAL_GROUP} extraParams={extraParams}
              onBeforeDelete={this.checkIfCanDeleteOrg.bind(this, ActivityConstants.REGIONAL_GROUP, ValueConstants.REGIONAL_GROUP)}
              onAfterUpdate={this.handleOrgListChange.bind(null, ActivityConstants.REGIONAL_GROUP, ValueConstants.REGIONAL_GROUP)} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity} fieldPath={ActivityConstants.SECTOR_GROUP} extraParams={extraParams}
              onBeforeDelete={this.checkIfCanDeleteOrg.bind(this, ActivityConstants.SECTOR_GROUP, ValueConstants.SECTOR_GROUP)}
              onAfterUpdate={this.handleOrgListChange.bind(null, ActivityConstants.SECTOR_GROUP, ValueConstants.SECTOR_GROUP)} />
          </Col>
        </Row>
      </Grid>
    </div>);
  }
}

export default AFSection(AFOrganizations, ORGANIZATIONS);
