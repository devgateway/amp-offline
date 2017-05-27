import React, { Component, PropTypes } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import { ORGANIZATIONS } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';
import afStyles from '../ActivityForm.css';

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
    LoggerManager.log('constructor');
  }

  render() {
    return (<div className={afStyles.full_width}>
      <Grid className={afStyles.full_width}>
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
