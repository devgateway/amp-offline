/* eslint-disable class-methods-use-this */
/* eslint-disable jsx-a11y/anchor-has-content */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Grid, Row } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as FPC from '../../../../../utils/constants/FieldPathConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';
import FieldsManager from '../../../../../modules/field/FieldsManager';
import AFField from '../../components/AFField';
import afStyles from '../../ActivityForm.css';
import styles from './AFFundingDetailItem.css';
import * as FMC from '../../../../../utils/constants/FeatureManagerConstants';

/**
 * @author Gabriel Inchauspe
 */
export default class AFFundingDetailItem extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    currentWorkspaceSettings: PropTypes.object.isRequired
  };

  static propTypes = {
    fundingDetail: PropTypes.object.isRequired,
    removeFundingDetailItem: PropTypes.func.isRequired,
    funding: PropTypes.object.isRequired,
    type: PropTypes.string
  };

  render() {
    // When adding a new item we select the default currency like in AMP.
    if (!this.props.fundingDetail[AC.CURRENCY].id) {
      const currency = Object.values(this.context.activityFieldsManager.possibleValuesMap[FPC.FUNDING_CURRENCY_PATH])
        .filter(pv => pv.value === this.context.currentWorkspaceSettings.currency.code);
      this.props.fundingDetail[AC.CURRENCY] = currency[0];
    }
    const orgGroupName = this.props.funding[AC.FUNDING_DONOR_ORG_ID][AC.EXTRA_INFO][AC.ORGANIZATION_GROUP];
    let fixedExchangeRateFMPath;
    let pledgeFMPath;
    switch (this.props.type) {
      case VC.COMMITMENTS:
        fixedExchangeRateFMPath = FMC.ACTIVITY_COMMITMENTS_FIXED_EXCHANGE_RATE;
        pledgeFMPath = FMC.ACTIVITY_COMMITMENTS_PLEDGES;
        break;
      case VC.DISBURSEMENTS:
        fixedExchangeRateFMPath = FMC.ACTIVITY_DISBURSEMENTS_FIXED_EXCHANGE_RATE;
        pledgeFMPath = FMC.ACTIVITY_DISBURSEMENTS_PLEDGES;
        break;
      case VC.EXPENDITURES:
        fixedExchangeRateFMPath = FMC.ACTIVITY_EXPENDITURES_FIXED_EXCHANGE_RATE;
        pledgeFMPath = FMC.ACTIVITY_EXPENDITURES_PLEDGES;
        break;
      default:
        break;
    }
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
              fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.TRANSACTION_AMOUNT}`} />
          </Col>
          <Col md={3} lg={3}>
            <AFField
              parent={this.props.fundingDetail}
              fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.CURRENCY}`} defaultValueAsEmptyObject />
          </Col>
          <Col md={3} lg={3}>
            <AFField
              parent={this.props.fundingDetail}
              fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.TRANSACTION_DATE}`} />
          </Col>
        </Row>
        <Row>
          <Col md={3} lg={3}>
            {(this.props.fundingDetail[AC.TRANSACTION_TYPE].value === VC.DISBURSEMENTS) ? <AFField
              parent={this.props.fundingDetail}
              fmPath={FMC.ACTIVITY_DISBURSEMENTS_DISBURSEMENT_ORDER_ID}
              fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.DISBURSEMENT_ORDER_ID}`} /> : null}
          </Col>
          <Col md={6} lg={6}>
            <AFField
              parent={this.props.fundingDetail}
              fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.PLEDGE}`}
              filter={[{ value: orgGroupName, path: `${AC.EXTRA_INFO}~${AC.ORGANIZATION_GROUP}` }]}
              fmPath={pledgeFMPath} />
          </Col>
        </Row>
        <Row>
          <Col md={3} lg={3}>
            <AFField
              parent={this.props.fundingDetail}
              fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.FIXED_EXCHANGE_RATE}`}
              fmPath={fixedExchangeRateFMPath}
              extraParams={{ bigger: 0 }} />
          </Col>
        </Row>
        <Row>
          <Col md={3} lg={3}>
            <a
              onClick={this.props.removeFundingDetailItem.bind(this, this.props.fundingDetail[AC.TEMPORAL_ID])}
              className={styles.delete} href={null}>&nbsp;</a>
          </Col>
        </Row>
      </Grid>
    </div>);
  }
}
