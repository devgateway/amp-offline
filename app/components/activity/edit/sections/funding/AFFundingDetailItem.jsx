/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';
import AFField from '../../components/AFField';
import * as AF from '../../components/AFComponentTypes';
import afStyles from '../../ActivityForm.css';
import styles from './AFFundingDetailItem.css';

/**
 * @author Gabriel Inchauspe
 */
export default class AFFundingDetailItem extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  static propTypes = {
    fundingDetail: PropTypes.object.isRequired,
    // type: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    return (<div className={afStyles.full_width}>
      <Grid className={styles.grid}>
        <Row>
          <Col md={3} lg={3}>
            <AFField
              parent={this.props.fundingDetail}
              fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.ADJUSTMENT_TYPE}`} />
          </Col>
          <Col md={3} lg={3}>
            <AFField
              parent={this.props.fundingDetail}
              fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.TRANSACTION_AMOUNT}`} type={AF.NUMBER} />
          </Col>
          <Col md={3} lg={3}>
            <AFField
              parent={this.props.fundingDetail}
              fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.CURRENCY}`} />
          </Col>
          <Col md={3} lg={3}>
            <AFField
              parent={this.props.fundingDetail}
              fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.TRANSACTION_DATE}`} />
          </Col>
        </Row>
        <Row>
          <Col md={3} lg={3}>
            <AFField
              parent={this.props.fundingDetail}
              fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.DISBURSEMENT_ORDER_ID}`} type={AF.NUMBER} />
          </Col>
        </Row>
      </Grid>
    </div>);
  }
}
