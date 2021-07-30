/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import { ActivityConstants, FieldsManager } from 'amp-ui';
import * as AF from '../../components/AFComponentTypes';
import Logger from '../../../../../modules/util/LoggerManager';
import AFField from '../../components/AFField';
import AFOverallFundingTotals from './AFOverallFundingTotals';
import AFProposedProjectCostTable from './AFProposedProjectCostTable';
import afStyles from '../../ActivityForm.css';

const logger = new Logger('AF project cost');

/**
 * @author Gabriel Inchauspe
 */
export default class AFProjectCost extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired
  };

  static propTypes = {
    activity: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  render() {
    const { activityFieldsManager } = this.context;
    return (<div className={afStyles.full_width} >
      <Grid className={afStyles.full_width} >
        <Row>
          <Col md={12} lg={12} >
            <AFProposedProjectCostTable activity={this.props.activity} />
          </Col>
        </Row>
        <Row>
          {(activityFieldsManager.isFieldPathEnabled(ActivityConstants.TOTAL_NUMBER_OF_FUNDING_SOURCES))
            ? (<Col md={5} lg={5} >
              <AFField
                parent={this.props.activity} fieldPath={ActivityConstants.TOTAL_NUMBER_OF_FUNDING_SOURCES}
                type={AF.NUMBER}
                extraParams={{ bigger: 0 }} />
            </Col>) : null}
          <Col md={5} lg={5} >
            <AFField parent={this.props.activity} fieldPath={ActivityConstants.TYPE_OF_COOPERATION} />
          </Col>
          <Col md={5} lg={5} >
            <AFField parent={this.props.activity} fieldPath={ActivityConstants.TYPE_OF_IMPLEMENTATION} />
          </Col>
          <Col md={5} lg={5} >
            <AFField parent={this.props.activity} fieldPath={ActivityConstants.MODALITIES} />
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
