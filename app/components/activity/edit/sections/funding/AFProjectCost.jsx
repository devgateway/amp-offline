/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as AF from '../../components/AFComponentTypes';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import AFField from '../../components/AFField';
import AFOverallFundingTotals from './AFOverallFundingTotals';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';
import AFProposedProjectCostTable from './AFProposedProjectCostTable';
import afStyles from '../../ActivityForm.css';

/**
 * @author Gabriel Inchauspe
 */
export default class AFProjectCost extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

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
          <Col md={12} lg={12} >
            <AFProposedProjectCostTable activity={this.props.activity} />
          </Col>
        </Row>
        <Row>
          <Col md={5} lg={5} >
            <AFField
              parent={this.props.activity} fieldPath={AC.TOTAL_NUMBER_OF_FUNDING_SOURCES} type={AF.NUMBER} min={0} />
          </Col>
          <Col md={5} lg={5} >
            <AFField parent={this.props.activity} fieldPath={AC.TYPE_OF_COOPERATION} />
          </Col>
          <Col md={5} lg={5} >
            <AFField parent={this.props.activity} fieldPath={AC.TYPE_OF_IMPLEMENTATION} />
          </Col>
          <Col md={5} lg={5} >
            <AFField parent={this.props.activity} fieldPath={AC.MODALITIES} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12} >
            <AFOverallFundingTotals activity={this.props.activity} />
          </Col>
        </Row>
      </Grid>
    </div>);
  }
}
