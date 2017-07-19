import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Grid, Row } from 'react-bootstrap';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import afStyles from '../ActivityForm.css';
import { PLANNING } from './AFSectionConstants';
import {
  LINE_MINISTRY_RANK,
  ORIGINAL_COMPLETION_DATE,
  PROPOSED_APPROVAL_DATE,
  PROPOSED_COMPLETION_DATE,
  ACTUAL_APPROVAL_DATE,
  FINAL_DATE_FOR_DISBURSEMENTS,
  FINAL_DATE_FOR_CONTRACTING,
  ACTUAL_COMPLETION_DATE,
  PROPOSED_START_DATE,
  ACTUAL_START_DATE
} from '../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Planning Section
 * @author Nadejda Mandrescu
 */
class AFPlanning extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    return (<div className={afStyles.full_width} >
      <Grid className={afStyles.full_width} >
        <Row>
          <Col md={6} lg={6} >
            <AFField parent={this.props.activity} fieldPath={LINE_MINISTRY_RANK} />
            <AFField parent={this.props.activity} fieldPath={PROPOSED_APPROVAL_DATE} />
            <AFField parent={this.props.activity} fieldPath={ACTUAL_APPROVAL_DATE} />
            <AFField parent={this.props.activity} fieldPath={FINAL_DATE_FOR_CONTRACTING} />
            <AFField parent={this.props.activity} fieldPath={PROPOSED_START_DATE} />
            <AFField parent={this.props.activity} fieldPath={ACTUAL_START_DATE} />
          </Col>
          <Col md={6} lg={6} >
            <AFField parent={this.props.activity} fieldPath={ORIGINAL_COMPLETION_DATE} />
            <AFField parent={this.props.activity} fieldPath={PROPOSED_COMPLETION_DATE} />
            <AFField parent={this.props.activity} fieldPath={FINAL_DATE_FOR_DISBURSEMENTS} />
            <AFField parent={this.props.activity} fieldPath={ACTUAL_COMPLETION_DATE} />
          </Col>
        </Row>
      </Grid>
    </div>);
  }
}

export default AFSection(AFPlanning, PLANNING);
