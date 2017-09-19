/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { FormGroup, Col, Grid, Row } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';
import AFFundingClassificationPanel from './AFFundingClassificationPanel';
import AFFundingDetailContainer from './AFFundingDetailContainer';
import AFField from '../../components/AFField';
import * as Types from '../../components/AFComponentTypes';

/**
 * @author Gabriel Inchauspe
 */
export default class AFFundingContainer extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  static propTypes = {
    funding: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.debug('constructor');
    this.state = {
      funding: this.props.funding,
      stateFundingDetail: this.props.funding[AC.FUNDING_DETAILS]
    };
    this._addTransactionItem = this._addTransactionItem.bind(this);
    this._removeTransactionItem = this._removeTransactionItem.bind(this);
    this._removeFundingDetailItem = this._removeFundingDetailItem.bind(this);
  }

  _addTransactionItem(type) {
    LoggerManager.debug('_addTransactionItem');
    const fundingDetailItem = {};
    fundingDetailItem[AC.REPORTING_DATE] = new Date().toISOString();
    const trnTypeList = this.context.activityFieldsManager
      .possibleValuesMap[`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.TRANSACTION_TYPE}`];
    const trnType = Object.values(trnTypeList).find(item => item.value === type);
    fundingDetailItem[AC.TRANSACTION_TYPE] = trnType;
    fundingDetailItem[AC.CURRENCY] = {};
    fundingDetailItem[AC.TRANSACTION_AMOUNT] = 0;
    fundingDetailItem[AC.ADJUSTMENT_TYPE] = {};
    const newFunding = this.state.funding;
    if (newFunding[AC.FUNDING_DETAILS] === undefined) {
      newFunding[AC.FUNDING_DETAILS] = [];
    }
    newFunding[AC.FUNDING_DETAILS].push(fundingDetailItem);
    this.setState({ funding: newFunding });
  }

  _removeTransactionItem(id) {
    LoggerManager.debug('_removeTransactionItem');
    // TODO: Display a confirm dialog to delete the item.
    const newFunding = this.state.funding;
    const index = this.state.fundingList.findIndex((item) => (item[AC.id] === id));
    newFunding[AC.FUNDING_DETAILS].splice(index, 1);
    this.setState({ funding: newFunding });
  }

  _removeFundingDetailItem(id) {
    LoggerManager.debug('_removeFundingDetailItem');
    // TODO: Display a confirm dialog to delete the funding item.
    const newFunding = this.state.stateFundingDetail;
    const index = this.state.stateFundingDetail.findIndex((item) => (item[AC.TEMPORAL_ID] === id));
    newFunding.splice(index, 1);
    this.setState({ stateFundingDetail: newFunding });
  }

  render() {
    // TODO: Implement 'MTEF Projections' table when available for sync.
    return (<div>
      <FormGroup>
        <Grid>
          <Row>
            <Col md={2} lg={2}>
              <AFField parent={this.state.funding} fieldPath={`${AC.FUNDINGS}~${AC.ACTIVE}`} type={Types.CHECKBOX} />
            </Col>
            <Col md={2} lg={2}>
              <AFField
                parent={this.state.funding} fieldPath={`${AC.FUNDINGS}~${AC.DELEGATED_COOPERATION}`}
                type={Types.CHECKBOX} />
            </Col>
            <Col md={2} lg={2}>
              <AFField
                parent={this.state.funding} fieldPath={`${AC.FUNDINGS}~${AC.DELEGATED_PARTNER}`}
                type={Types.CHECKBOX} />
            </Col>
          </Row>
        </Grid>
      </FormGroup>
      <AFFundingClassificationPanel funding={this.state.funding} />
      <AFFundingDetailContainer
        fundingDetail={this.state.stateFundingDetail}
        type={VC.COMMITMENTS}
        removeFundingDetailItem={this._removeFundingDetailItem}
        handleNewTransaction={this._addTransactionItem} />
      <AFFundingDetailContainer
        fundingDetail={this.state.stateFundingDetail}
        type={VC.DISBURSEMENTS}
        removeFundingDetailItem={this._removeFundingDetailItem}
        handleNewTransaction={this._addTransactionItem} />
      <AFFundingDetailContainer
        fundingDetail={this.state.stateFundingDetail}
        type={VC.EXPENDITURES}
        removeFundingDetailItem={this._removeFundingDetailItem}
        handleNewTransaction={this._addTransactionItem} />
    </div>);
  }
}
