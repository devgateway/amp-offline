/* eslint-disable class-methods-use-this */
/* eslint-disable no-alert */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import { Col, FormGroup, Grid, Row } from 'react-bootstrap';
import { ActivityConstants, FieldsManager, GlobalSettingsConstants } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
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
    hasErrors: PropTypes.func.isRequired,
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
    let year = GlobalSettingsManager.getSettingByKey(GlobalSettingsConstants.GS_CURRENT_FISCAL_YEAR);
    if (this.props.funding[ActivityConstants.MTEF_PROJECTIONS] &&
      this.props.funding[ActivityConstants.MTEF_PROJECTIONS].length > 0) {
      year = Math.max(...this.props.funding[ActivityConstants.MTEF_PROJECTIONS]
        .map((i) => Moment(i[ActivityConstants.PROJECTION_DATE]).year())) + 1;
    }
    mtefItem[ActivityConstants.PROJECTION_DATE] = DateUtils.formatDateForAPI(Moment(`${year}-01-01`));
    mtefItem[ActivityConstants.PROJECTION] = {};
    mtefItem[ActivityConstants.CURRENCY] = {};
    mtefItem[ActivityConstants.AMOUNT] = undefined;
    const newFunding = this.props.funding;
    if (newFunding[ActivityConstants.MTEF_PROJECTIONS] === undefined) {
      newFunding[ActivityConstants.MTEF_PROJECTIONS] = [];
    }
    newFunding[ActivityConstants.MTEF_PROJECTIONS].push(mtefItem);
    this.setState({ funding: newFunding });
  }

  _removeMTEFProjectionItem(id) {
    logger.debug('_removeMTEFProjectionItem');
    if (confirm(translate('deleteMTEFProjectionItem'))) {
      const newMTEFList = this.props.funding[ActivityConstants.MTEF_PROJECTIONS].slice();
      const index = newMTEFList.findIndex((item) => (item[ActivityConstants.TEMPORAL_ID] === id));
      newMTEFList.splice(index, 1);
      const newFunding = this.props.funding;
      newFunding[ActivityConstants.MTEF_PROJECTIONS] = newMTEFList;
      this.setState({ funding: newFunding });
    }
  }

  _addTransactionItem(trnType) {
    logger.debug('_addTransactionItem');
    const fundingDetailItem = {};
    fundingDetailItem[ActivityConstants.REPORTING_DATE] = DateUtils.getTimestampForAPI(new Date());
    fundingDetailItem[ActivityConstants.CURRENCY] = {};
    fundingDetailItem[ActivityConstants.TRANSACTION_AMOUNT] = undefined;
    fundingDetailItem[ActivityConstants.ADJUSTMENT_TYPE] = undefined;
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
      const index = newFundingDetails.findIndex((item) => (item[ActivityConstants.TEMPORAL_ID] === id));
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
              <AFField
                parent={funding} fieldPath={`${ActivityConstants.FUNDINGS}~${ActivityConstants.ACTIVE}`}
                type={Types.CHECKBOX} />
            </Col>
            <Col md={2} lg={2}>
              <AFField
                parent={funding} fieldPath={`${ActivityConstants.FUNDINGS}~${ActivityConstants.DELEGATED_COOPERATION}`}
                type={Types.CHECKBOX} />
            </Col>
            <Col md={2} lg={2}>
              <AFField
                parent={funding} fieldPath={`${ActivityConstants.FUNDINGS}~${ActivityConstants.DELEGATED_PARTNER}`}
                type={Types.CHECKBOX} />
            </Col>
          </Row>
        </Grid>
      </FormGroup>
      <AFFundingClassificationPanel
        funding={funding} hasErrors={this.props.hasErrors}
        activityFieldsManager={this.context.activityFieldsManager} />
      <AFMTEFProjectionContainer
        mtefProjections={funding[ActivityConstants.MTEF_PROJECTIONS] || []} hasErrors={this.props.hasErrors}
        funding={funding}
        handleRemoveItem={this._removeMTEFProjectionItem} handleNewItem={this._addMTEFProjectionItem} />
      <AFFundingDetailContainer
        trnType={ActivityConstants.COMMITMENTS}
        removeFundingDetailItem={this._removeFundingDetailItem.bind(this, ActivityConstants.COMMITMENTS)}
        hasErrors={this.props.hasErrors}
        handleNewTransaction={this._addTransactionItem}
        funding={funding} />
      <AFFundingDetailContainer
        trnType={ActivityConstants.DISBURSEMENTS}
        removeFundingDetailItem={this._removeFundingDetailItem.bind(this, ActivityConstants.DISBURSEMENTS)}
        hasErrors={this.props.hasErrors}
        handleNewTransaction={this._addTransactionItem}
        funding={funding} />
      <AFFundingDetailContainer
        trnType={ActivityConstants.EXPENDITURES}
        removeFundingDetailItem={this._removeFundingDetailItem.bind(this, ActivityConstants.EXPENDITURES)}
        hasErrors={this.props.hasErrors}
        handleNewTransaction={this._addTransactionItem}
        funding={funding} />
      <AFField
        parent={funding} fieldPath={`${ActivityConstants.FUNDINGS}~${ActivityConstants.DONOR_OBJECTIVE}`}
        type={Types.TEXT_AREA} />
      <AFField
        key={Math.random()} parent={funding} fieldPath={`${ActivityConstants.FUNDINGS}~${ActivityConstants.CONDITIONS}`}
        type={Types.TEXT_AREA} />
    </div>);
  }
}
