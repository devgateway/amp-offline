/* eslint-disable class-methods-use-this */
/* eslint-disable no-alert */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import { Col, FormGroup, Grid, Row } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
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
    mtefItem[AC.PROJECTION_DATE] = DateUtils.formatDateForAPI(Moment(`${year}-01-01`));
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

  _addTransactionItem(trnType) {
    logger.debug('_addTransactionItem');
    const fundingDetailItem = {};
    fundingDetailItem[AC.REPORTING_DATE] = DateUtils.getTimestampForAPI(new Date());
    fundingDetailItem[AC.CURRENCY] = {};
    fundingDetailItem[AC.TRANSACTION_AMOUNT] = undefined;
    fundingDetailItem[AC.ADJUSTMENT_TYPE] = undefined;
    const newFunding = this.props.funding;
    newFunding.fundingClassificationOpen = true;
    if (newFunding[trnType] === undefined) {
      newFunding[trnType] = [];
    }
    newFunding[trnType].push(fundingDetailItem);
    this.setState({ funding: newFunding });
  }

  _removeFundingDetailItem(trnType, id) {
    logger.debug('_removeFundingDetailItem');
    if (confirm(translate('deleteFundingTransactionItem'))) {
      const newFundingDetails = this.props.funding[trnType].slice();
      const index = newFundingDetails.findIndex((item) => (item[AC.TEMPORAL_ID] === id));
      newFundingDetails.splice(index, 1);
      const newFunding = this.props.funding;
      newFunding[trnType] = newFundingDetails;
      this.setState({ funding: newFunding });
    }
  }

  render() {
    const { funding } = this.props;
    return (<div>
      <FormGroup>
        <Grid>
          <Row>
            <Col md={2} lg={2}>
              <AFField parent={funding} fieldPath={`${AC.FUNDINGS}~${AC.ACTIVE}`} type={Types.CHECKBOX} />
            </Col>
            <Col md={2} lg={2}>
              <AFField
                parent={funding} fieldPath={`${AC.FUNDINGS}~${AC.DELEGATED_COOPERATION}`}
                type={Types.CHECKBOX} />
            </Col>
            <Col md={2} lg={2}>
              <AFField
                parent={funding} fieldPath={`${AC.FUNDINGS}~${AC.DELEGATED_PARTNER}`}
                type={Types.CHECKBOX} />
            </Col>
          </Row>
        </Grid>
      </FormGroup>
      <AFFundingClassificationPanel funding={funding} hasErrors={this.props.hasErrors} />
      <AFMTEFProjectionContainer
        mtefProjections={funding[AC.MTEF_PROJECTIONS] || []} hasErrors={this.props.hasErrors} funding={funding}
        handleRemoveItem={this._removeMTEFProjectionItem} handleNewItem={this._addMTEFProjectionItem} />
      <AFFundingDetailContainer
        trnType={AC.COMMITMENTS}
        removeFundingDetailItem={this._removeFundingDetailItem.bind(this, AC.COMMITMENTS)}
        hasErrors={this.props.hasErrors}
        handleNewTransaction={this._addTransactionItem}
        funding={funding} />
      <AFFundingDetailContainer
        trnType={AC.DISBURSEMENTS}
        removeFundingDetailItem={this._removeFundingDetailItem.bind(this, AC.DISBURSEMENTS)}
        hasErrors={this.props.hasErrors}
        handleNewTransaction={this._addTransactionItem}
        funding={funding} />
      <AFFundingDetailContainer
        trnType={AC.EXPENDITURES}
        removeFundingDetailItem={this._removeFundingDetailItem.bind(this, AC.EXPENDITURES)}
        hasErrors={this.props.hasErrors}
        handleNewTransaction={this._addTransactionItem}
        funding={funding} />
      <AFField parent={funding} fieldPath={`${AC.FUNDINGS}~${AC.DONOR_OBJECTIVE}`} type={Types.TEXT_AREA} />
      <AFField
        key={Math.random()} parent={funding} fieldPath={`${AC.FUNDINGS}~${AC.CONDITIONS}`}
        type={Types.TEXT_AREA} />
    </div>);
  }
}
