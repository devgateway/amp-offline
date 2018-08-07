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
import { ACTIVITY_ORGANIZATIONS_DONOR_ORGANIZATION } from '../../../../utils/constants/FeatureManagerConstants';
import { RESPONSIBLE_ORGANIZATION_BUDGETS_PATH } from '../../../../utils/constants/FieldPathConstants';
import AFOption from '../components/AFOption';

const logger = new Logger('AF organizations');

const orgFormatter = (org: AFOption) => `(${org[AC.EXTRA_INFO][AC.ACRONYM].trim()}) - ${org.translatedValue.trim()}`;

/**
 * Organizations Section
 * @author Nadejda Mandrescu
 */
class AFOrganizations extends Component {

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.setState({ validationError: undefined });
    this.checkValidationError = this.checkValidationError.bind(this);
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
              fmPath={ACTIVITY_ORGANIZATIONS_DONOR_ORGANIZATION} />
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
                ...extraParams }}
              onAfterUpdate={this.checkValidationError} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity} fieldPath={AC.EXECUTING_AGENCY} extraParams={extraParams}
              onAfterUpdate={this.checkValidationError} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity} fieldPath={AC.IMPLEMENTING_AGENCY} extraParams={extraParams}
              onAfterUpdate={this.checkValidationError} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity} fieldPath={AC.BENEFICIARY_AGENCY} extraParams={extraParams}
              onAfterUpdate={this.checkValidationError} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity} fieldPath={AC.CONTRACTING_AGENCY} extraParams={extraParams}
              onAfterUpdate={this.checkValidationError} />
          </Col>
        </Row>
      </Grid>
    </div>);
  }
}

export default AFSection(AFOrganizations, ORGANIZATIONS);
