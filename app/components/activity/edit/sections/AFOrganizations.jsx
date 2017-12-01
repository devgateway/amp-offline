import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, FormControl, FormGroup, Grid, HelpBlock, Row } from 'react-bootstrap';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import { ORGANIZATIONS } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import Logger from '../../../../modules/util/LoggerManager';
import afStyles from '../ActivityForm.css';
import { ACTIVITY_ORGANIZATIONS_DONOR_ORGANIZATION } from '../../../../utils/constants/FeatureManagerConstants';

const logger = new Logger('AF organizations');

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
  }

  /**
   * This a link to general organization dependencies validation error processing
   * @return {undefined}
   */
  getValidationError() {
    const { activity } = this.props;
    let dependencyErrors = (activity.errors && activity.errors.filter(error => error.path === AC.ORGANIZATION)) || [];
    dependencyErrors = dependencyErrors.map(error => error.errorMessage);
    return dependencyErrors.length ? dependencyErrors : undefined;
  }

  render() {
    const validationError = this.getValidationError();
    const validationStyle = `${afStyles.activity_form_control} ${afStyles.help_block}`;
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
              fieldPath={AC.DONOR_ORGANIZATION}
              fmPath={ACTIVITY_ORGANIZATIONS_DONOR_ORGANIZATION} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField parent={this.props.activity} fieldPath={AC.RESPONSIBLE_ORGANIZATION} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField parent={this.props.activity} fieldPath={AC.EXECUTING_AGENCY} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField parent={this.props.activity} fieldPath={AC.IMPLEMENTING_AGENCY} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField parent={this.props.activity} fieldPath={AC.BENEFICIARY_AGENCY} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField parent={this.props.activity} fieldPath={AC.CONTRACTING_AGENCY} />
          </Col>
        </Row>
      </Grid>
    </div>);
  }
}

export default AFSection(AFOrganizations, ORGANIZATIONS);
