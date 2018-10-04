import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, FormControl, FormGroup, Grid, HelpBlock, Row } from 'react-bootstrap';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import BudgetCode from './organization/BudgetCode';
import { ORGANIZATIONS } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import Logger from '../../../../modules/util/LoggerManager';
import afStyles from '../ActivityForm.css';
import * as FMC from '../../../../utils/constants/FeatureManagerConstants';
import { RESPONSIBLE_ORGANIZATION_BUDGETS_PATH } from '../../../../utils/constants/FieldPathConstants';
import AFOption from '../components/AFOption';
import FeatureManager from '../../../../modules/util/FeatureManager';
import AFUtils from './../util/AFUtils';
import FieldsManager from '../../../../modules/field/FieldsManager';
import * as VC from '../../../../utils/constants/ValueConstants';
import translate from '../../../../utils/translate';

const logger = new Logger('AF organizations');

const orgTypes = {
  [AC.BENEFICIARY_AGENCY]: 'BENEFICIARY_AGENCY',
  [AC.CONTRACTING_AGENCY]: 'CONTRACTING_AGENCY',
  [AC.DONOR_ORGANIZATION]: 'DONOR_ORGANIZATION',
  [AC.EXECUTING_AGENCY]: 'EXECUTING_AGENCY',
  [AC.IMPLEMENTING_AGENCY]: 'IMPLEMENTING_AGENCY',
  [AC.REGIONAL_GROUP]: 'REGIONAL_GROUP',
  [AC.RESPONSIBLE_ORGANIZATION]: 'RESPONSIBLE_ORGANIZATION',
  [AC.SECTOR_GROUP]: 'SECTOR_GROUP'
};

const orgFormatter = (org: AFOption) => {
  const acronym = org[AC.EXTRA_INFO][AC.ACRONYM] ? org[AC.EXTRA_INFO][AC.ACRONYM].trim() : '';
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
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired
  };

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  static checkIfAutoAddFundingEnabled(orgTypeCode) {
    const orgTypeConstantName = orgTypes[orgTypeCode];
    const fmc = `ACTIVITY_ORGANIZATIONS_${orgTypeConstantName}_ADD_FUNDING_AUTO`;
    return FeatureManager.isFMSettingEnabled(FMC[fmc]);
  }

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
    if (activity[AC.COMPONENTS] && activity[AC.COMPONENTS].length) {
      const compFundOrgPath = `${AC.COMPONENTS}~${AC.COMPONENT_FUNDING}~${AC.COMPONENT_ORGANIZATION}`;
      const compOrgsErrors = [];
      activity[AC.COMPONENTS].forEach(component => {
        const compFunding = component[AC.COMPONENT_FUNDING];
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

  checkIfOrganizationAndOrgTypeHasFunding(orgTypeName, organization) {
    const { activity } = this.props;
    const fundingList = activity[AC.FUNDINGS] || [];
    const sourceRoleOn = this.context.activityFieldsManager.isFieldPathEnabled(`${AC.FUNDINGS}~${AC.SOURCE_ROLE}`);
    return fundingList.find(f => (f[AC.FUNDING_DONOR_ORG_ID].id === organization[AC.ORGANIZATION].id
      && (sourceRoleOn ? f[AC.SOURCE_ROLE].value === orgTypeName : true)));
  }

  addFundingAutomatically(orgTypeCode, orgTypeName) {
    if (AFOrganizations.checkIfAutoAddFundingEnabled(orgTypeCode)) {
      const { activity } = this.props;
      const { activityFieldsManager } = this.context;
      const fundingList = activity[AC.FUNDINGS] || [];
      activity[orgTypeCode].forEach(org => {
        const fundingFound = this.checkIfOrganizationAndOrgTypeHasFunding(orgTypeName, org);
        if (!fundingFound) {
          const fundingItem = AFUtils.createFundingItem(activityFieldsManager, org[AC.ORGANIZATION], orgTypeName);
          fundingList.push(fundingItem);
          activity[AC.FUNDINGS] = fundingList;
        }
      });
    }
  }

  // TODO: Implement removeItemAutomatically() once we always have the source_role field.

  handleOrgListChange(orgTypeCode, orgCodeName) {
    this.addFundingAutomatically(orgTypeCode, orgCodeName);
    this.checkValidationError();
  }

  checkIfCanDeleteOrg(orgTypeCode, orgTypeName, organization) {
    let canDelete = true;
    if (AFOrganizations.checkIfAutoAddFundingEnabled(orgTypeCode)
      && this.checkIfOrganizationAndOrgTypeHasFunding(orgTypeName, organization)) {
      alert(translate('fundingRelated'));
      canDelete = false;
    }
    return canDelete;
  }

  render() {
    const validationError = this.getValidationError();
    const validationStyle = `${afStyles.activity_form_control} ${afStyles.help_block}`;
    const extraParams = { afOptionFormatter: orgFormatter, sortByDisplayValue: true };
    return (<div className={afStyles.full_width}>
      <Grid className={afStyles.full_width}>
        <Row>
          <Col md={12} lg={12}>
            <FormGroup controlId={AC.ORGANIZATION} validationState={validationError ? 'error' : null}>
              <FormControl.Feedback />
              <HelpBlock className={validationStyle}>{validationError}</HelpBlock>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity}
              fieldPath={AC.DONOR_ORGANIZATION} extraParams={extraParams}
              fmPath={FMC.ACTIVITY_ORGANIZATIONS_DONOR_ORGANIZATION}
              onAfterUpdate={this.handleOrgListChange.bind(null, AC.DONOR_ORGANIZATION, VC.DONOR_AGENCY)} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity} fieldPath={AC.RESPONSIBLE_ORGANIZATION}
              extraParams={{
                custom: {
                  [RESPONSIBLE_ORGANIZATION_BUDGETS_PATH]: BudgetCode(RESPONSIBLE_ORGANIZATION_BUDGETS_PATH)
                },
                ...extraParams
              }}
              onAfterUpdate={this.handleOrgListChange.bind(null, AC.RESPONSIBLE_ORGANIZATION,
                VC.RESPONSIBLE_ORGANIZATION)} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity} fieldPath={AC.EXECUTING_AGENCY}
              extraParams={extraParams}
              onBeforeDelete={this.checkIfCanDeleteOrg.bind(this, AC.EXECUTING_AGENCY, VC.EXECUTING_AGENCY)}
              onAfterUpdate={this.handleOrgListChange.bind(null, AC.EXECUTING_AGENCY, VC.EXECUTING_AGENCY)} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity} fieldPath={AC.IMPLEMENTING_AGENCY} extraParams={extraParams}
              onAfterUpdate={this.handleOrgListChange.bind(null, AC.IMPLEMENTING_AGENCY, VC.IMPLEMENTING_AGENCY)} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity} fieldPath={AC.BENEFICIARY_AGENCY} extraParams={extraParams}
              onAfterUpdate={this.handleOrgListChange.bind(null, AC.BENEFICIARY_AGENCY, VC.BENEFICIARY_AGENCY)} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity} fieldPath={AC.CONTRACTING_AGENCY} extraParams={extraParams}
              onAfterUpdate={this.handleOrgListChange.bind(null, AC.CONTRACTING_AGENCY, VC.CONTRACTING_AGENCY)} />
          </Col>
        </Row>
      </Grid>
    </div>);
  }
}

export default AFSection(AFOrganizations, ORGANIZATIONS);
