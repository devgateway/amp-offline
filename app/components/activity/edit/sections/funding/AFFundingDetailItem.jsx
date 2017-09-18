/* eslint-disable class-methods-use-this */
/* esling-disable jsx-a11y/anchor-has-content */
import React, { Component, PropTypes } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
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
    removeFundingDetailItem: PropTypes.func.isRequired
  };

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
          <Col md={3} lg={3}>
            <a
              onClick={this.props.removeFundingDetailItem.bind(this, this.props.fundingDetail[AC.TEMPORAL_ID])}
              className={styles.delete} href={null} />
          </Col>
        </Row>
      </Grid>
    </div>);
  }
}
