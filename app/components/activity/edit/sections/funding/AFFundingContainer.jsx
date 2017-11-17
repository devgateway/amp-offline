/* eslint-disable class-methods-use-this */
/* eslint-disable no-alert */
import React, { Component, PropTypes } from 'react';
import { FormGroup, Col, Grid, Row } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';
import Logger from '../../../../../modules/util/LoggerManager';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';
import AFFundingClassificationPanel from './AFFundingClassificationPanel';
import AFFundingDetailContainer from './AFFundingDetailContainer';
import AFField from '../../components/AFField';
import * as Types from '../../components/AFComponentTypes';
import translate from '../../../../../utils/translate';
import DateUtils from '../../../../../utils/DateUtils';

const logger = new Logger('AF funding container');

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
    logger.debug('constructor');
    this.state = {
      funding: this.props.funding,
      stateFundingDetail: this.props.funding[AC.FUNDING_DETAILS]
    };
    this._addTransactionItem = this._addTransactionItem.bind(this);
    this._removeFundingDetailItem = this._removeFundingDetailItem.bind(this);
  }

  _addTransactionItem(type) {
    logger.debug('_addTransactionItem');
    const fundingDetailItem = {};
    fundingDetailItem[AC.REPORTING_DATE] = DateUtils.getISODateForAPI(new Date());
    const trnTypeList = this.context.activityFieldsManager
      .possibleValuesMap[`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.TRANSACTION_TYPE}`];
    const trnType = Object.values(trnTypeList).find(item => item.value === type);
    fundingDetailItem[AC.TRANSACTION_TYPE] = trnType;
    fundingDetailItem[AC.CURRENCY] = {};
    fundingDetailItem[AC.TRANSACTION_AMOUNT] = undefined;
    fundingDetailItem[AC.ADJUSTMENT_TYPE] = undefined;
    const newFunding = this.state.funding;
    if (newFunding[AC.FUNDING_DETAILS] === undefined) {
      newFunding[AC.FUNDING_DETAILS] = [];
    }
    newFunding[AC.FUNDING_DETAILS].push(fundingDetailItem);
    this.setState({ funding: newFunding });
  }

  _removeFundingDetailItem(id) {
    logger.debug('_removeFundingDetailItem');
    if (confirm(translate('deleteFundingTransactionItem'))) {
      const newFunding = this.state.stateFundingDetail;
      const index = this.state.stateFundingDetail.findIndex((item) => (item[AC.TEMPORAL_ID] === id));
      newFunding.splice(index, 1);
      this.setState({ stateFundingDetail: newFunding });
    }
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
      <AFFundingClassificationPanel funding={this.state.funding} fundingDetails={this.state.stateFundingDetail} />
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
