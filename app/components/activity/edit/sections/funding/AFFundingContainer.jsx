/* eslint-disable class-methods-use-this */
/* eslint-disable no-alert */
import React, { Component, PropTypes } from 'react';
import Moment from 'moment';
import { Col, FormGroup, Grid, Row } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';
import * as GS from '../../../../../utils/constants/GlobalSettingsConstants';
import Logger from '../../../../../modules/util/LoggerManager';
import FieldsManager from '../../../../../modules/field/FieldsManager';
import AFFundingClassificationPanel from './AFFundingClassificationPanel';
import AFFundingDetailContainer from './AFFundingDetailContainer';
import AFMTEFProjectionContainer from './AFMTEFProjectionContainer';
import AFField from '../../components/AFField';
import * as Types from '../../components/AFComponentTypes';
import translate from '../../../../../utils/translate';
import DateUtils from '../../../../../utils/DateUtils';
import GlobalSettingsManager from '../../../../../modules/util/GlobalSettingsManager';

const logger = new Logger('AF funding container');

/**
 * @author Gabriel Inchauspe
 */
export default class AFFundingContainer extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired
  };

  static propTypes = {
    funding: PropTypes.object.isRequired,
    hasErrors: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this._addTransactionItem = this._addTransactionItem.bind(this);
    this._removeFundingDetailItem = this._removeFundingDetailItem.bind(this);
    this._addMTEFProjectionItem = this._addMTEFProjectionItem.bind(this);
    this._removeMTEFProjectionItem = this._removeMTEFProjectionItem.bind(this);
  }

  _addMTEFProjectionItem() {
    logger.debug('_addMTEFProjectionItem');
    const mtefItem = {};
    // Get default year from GS and auto-increment each new item.
    let year = GlobalSettingsManager.getSettingByKey(GS.GS_CURRENT_FISCAL_YEAR);
    if (this.props.funding[AC.MTEF_PROJECTIONS] && this.props.funding[AC.MTEF_PROJECTIONS].length > 0) {
      year = Math.max(...this.props.funding[AC.MTEF_PROJECTIONS].map((i) => Moment(i[AC.PROJECTION_DATE]).year())) + 1;
    }
    mtefItem[AC.PROJECTION_DATE] = DateUtils.getISODateForAPI(Moment(`${year}-01-01`));
    mtefItem[AC.PROJECTION] = {};
    mtefItem[AC.CURRENCY] = {};
    mtefItem[AC.AMOUNT] = undefined;
    const newFunding = this.props.funding;
    if (newFunding[AC.MTEF_PROJECTIONS] === undefined) {
      newFunding[AC.MTEF_PROJECTIONS] = [];
    }
    newFunding[AC.MTEF_PROJECTIONS].push(mtefItem);
    this.setState({ funding: newFunding });
  }

  _removeMTEFProjectionItem(id) {
    logger.debug('_removeMTEFProjectionItem');
    if (confirm(translate('deleteMTEFProjectionItem'))) {
      const newMTEFList = this.props.funding[AC.MTEF_PROJECTIONS].slice();
      const index = newMTEFList.findIndex((item) => (item[AC.TEMPORAL_ID] === id));
      newMTEFList.splice(index, 1);
      const newFunding = this.props.funding;
      newFunding[AC.MTEF_PROJECTIONS] = newMTEFList;
      this.setState({ funding: newFunding });
    }
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
    const newFunding = this.props.funding;
    if (newFunding[AC.FUNDING_DETAILS] === undefined) {
      newFunding[AC.FUNDING_DETAILS] = [];
    }
    newFunding[AC.FUNDING_DETAILS].push(fundingDetailItem);
    this.setState({ funding: newFunding });
  }

  _removeFundingDetailItem(id) {
    logger.debug('_removeFundingDetailItem');
    if (confirm(translate('deleteFundingTransactionItem'))) {
      const newFundingDetails = this.props.funding[AC.FUNDING_DETAILS].slice();
      const index = newFundingDetails.findIndex((item) => (item[AC.TEMPORAL_ID] === id));
      newFundingDetails.splice(index, 1);
      const newFunding = this.props.funding;
      newFunding[AC.FUNDING_DETAILS] = newFundingDetails;
      this.setState({ funding: newFunding });
    }
  }

  render() {
    return (<div>
      <FormGroup>
        <Grid>
          <Row>
            <Col md={2} lg={2}>
              <AFField parent={this.props.funding} fieldPath={`${AC.FUNDINGS}~${AC.ACTIVE}`} type={Types.CHECKBOX} />
            </Col>
            <Col md={2} lg={2}>
              <AFField
                parent={this.props.funding} fieldPath={`${AC.FUNDINGS}~${AC.DELEGATED_COOPERATION}`}
                type={Types.CHECKBOX} />
            </Col>
            <Col md={2} lg={2}>
              <AFField
                parent={this.props.funding} fieldPath={`${AC.FUNDINGS}~${AC.DELEGATED_PARTNER}`}
                type={Types.CHECKBOX} />
            </Col>
          </Row>
        </Grid>
      </FormGroup>
      <AFFundingClassificationPanel
        funding={this.props.funding} fundingDetails={this.props.funding[AC.FUNDING_DETAILS]}
        hasErrors={this.props.hasErrors} />
      <AFMTEFProjectionContainer
        mtefProjections={this.props.funding[AC.MTEF_PROJECTIONS] || []} hasErrors={this.props.hasErrors}
        funding={this.props.funding}
        handleRemoveItem={this._removeMTEFProjectionItem} handleNewItem={this._addMTEFProjectionItem} />
      <AFFundingDetailContainer
        fundingDetail={this.props.funding[AC.FUNDING_DETAILS]}
        type={VC.COMMITMENTS}
        removeFundingDetailItem={this._removeFundingDetailItem}
        hasErrors={this.props.hasErrors}
        handleNewTransaction={this._addTransactionItem}
        funding={this.props.funding} />
      <AFFundingDetailContainer
        fundingDetail={this.props.funding[AC.FUNDING_DETAILS]}
        type={VC.DISBURSEMENTS}
        removeFundingDetailItem={this._removeFundingDetailItem}
        hasErrors={this.props.hasErrors}
        handleNewTransaction={this._addTransactionItem}
        funding={this.props.funding} />
      <AFFundingDetailContainer
        fundingDetail={this.props.funding[AC.FUNDING_DETAILS]}
        type={VC.EXPENDITURES}
        removeFundingDetailItem={this._removeFundingDetailItem}
        hasErrors={this.props.hasErrors}
        handleNewTransaction={this._addTransactionItem}
        funding={this.props.funding} />
      <AFField parent={this.props.funding} fieldPath={`${AC.FUNDINGS}~${AC.DONOR_OBJECTIVE}`} type={Types.TEXT_AREA} />
      <AFField
        key={Math.random()} parent={this.props.funding} fieldPath={`${AC.FUNDINGS}~${AC.CONDITIONS}`}
        type={Types.TEXT_AREA} />
    </div>);
  }
}
