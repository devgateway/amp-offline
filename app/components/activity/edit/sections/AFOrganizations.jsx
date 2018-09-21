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

const logger = new Logger('AF organizations');

const orgTypes = ['BENEFICIARY_AGENCY',
  'CONTRACTING_AGENCY',
  'DONOR_ORGANIZATION',
  'EXECUTING_AGENCY',
  'IMPLEMENTING_AGENCY',
  'REGIONAL_GROUP',
  'RESPONSIBLE_ORGANIZATION',
  'SECTOR_GROUP'];

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

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.setState({ validationError: undefined });
    this.handleAddOrganization = this.handleAddOrganization.bind(this);
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

  addFundingAutomatically() {
    // If "Add Funding Item Automatically" is enabled we check if every organization has a funding.
    // TODO: ver de simplificar todo esto y solo agregar el org nuevo, no recorrer todo.
    const { activity } = this.props;
    const fundingList = activity.fundings || [];
    orgTypes.forEach(orgType => {
      const fmc = `ACTIVITY_ORGANIZATIONS_${orgType}_ADD_FUNDING_AUTO`;
      if (FeatureManager.isFMSettingEnabled(FMC[fmc]) && activity[AC[orgType]] && activity[AC[orgType]].length > 0) {
        activity[AC[orgType]].forEach(org => {
          if (!activity[AC.FUNDINGS]
            || !activity[AC.FUNDINGS].find(f => f[AC.FUNDING_DONOR_ORG_ID].id === org[AC.ORGANIZATION].id)) {
            const fundingItem = AFUtils.createFundingItem(this.context.activityFieldsManager, org[AC.ORGANIZATION]);
            fundingList.push(fundingItem);
            activity[AC.FUNDINGS] = fundingList;
          }
        });
      }
    });
  }

  handleAddOrganization() {
    // todo: agregar el funding solo si se agrego el org satisfactoriamente?
    // todo: y hay q implementar un remove funding tambien?
    this.addFundingAutomatically();
    this.checkValidationError();
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
              fmPath={FMC.ACTIVITY_ORGANIZATIONS_DONOR_ORGANIZATION} />
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
              onAfterUpdate={this.handleAddOrganization} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity} fieldPath={AC.EXECUTING_AGENCY} extraParams={extraParams}
              onAfterUpdate={this.handleAddOrganization} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity} fieldPath={AC.IMPLEMENTING_AGENCY} extraParams={extraParams}
              onAfterUpdate={this.handleAddOrganization} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity} fieldPath={AC.BENEFICIARY_AGENCY} extraParams={extraParams}
              onAfterUpdate={this.handleAddOrganization} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity} fieldPath={AC.CONTRACTING_AGENCY} extraParams={extraParams}
              onAfterUpdate={this.handleAddOrganization} />
          </Col>
        </Row>
      </Grid>
    </div>);
  }
}

export default AFSection(AFOrganizations, ORGANIZATIONS);
