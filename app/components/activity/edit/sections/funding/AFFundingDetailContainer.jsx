/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { Button, Panel } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';
import Logger from '../../../../../modules/util/LoggerManager';
import FieldsManager from '../../../../../modules/field/FieldsManager';
import translate from '../../../../../utils/translate';
import AFFundingDetailItem from './AFFundingDetailItem';
import * as Utils from '../../../../../utils/Utils';
import fundingStyles from './AFFundingContainer.css';

const logger = new Logger('AF funding detail container');

/**
 * @author Gabriel Inchauspe
 */
export default class AFFundingDetailContainer extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired
  };

  static propTypes = {
    trnType: PropTypes.string.isRequired,
    handleNewTransaction: PropTypes.func.isRequired,
    removeFundingDetailItem: PropTypes.func.isRequired,
    hasErrors: PropTypes.func.isRequired,
    funding: PropTypes.object.isRequired,
    refreshFundingDonorSectionErrors: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    const errors = this.hasErrors(props.funding, props.trnType);
    this.state = {
      errors,
      refresh: 0
    };
    if (errors) {
      this._setOpenStatus(props.trnType, true);
    }
    this._onChildUpdate = this._onChildUpdate.bind(this);
    this._setOpenStatus = this._setOpenStatus.bind(this);
  }

  hasErrors(funding, trnType) {
    return this.props.hasErrors(funding[trnType]);
  }

  _setOpenStatus(trnType, value) {
    switch (trnType) {
      case AC.COMMITMENTS:
        this.props.funding.commitmentsStatusOpen = value;
        break;
      case AC.DISBURSEMENTS:
        this.props.funding.disbursementsStatusOpen = value;
        break;
      case AC.EXPENDITURES:
        this.props.funding.expendituresStatusOpen = value;
        break;
      default:
        break;
    }
  }

  _addTransactionItem() {
    this.props.handleNewTransaction(this.props.trnType);
  }

  _onChildUpdate() {
    const errors = this.hasErrors(this.props.funding, this.props.trnType);
    this.setState({ errors });
    this.props.refreshFundingDonorSectionErrors(errors);
  }

  render() {
    const { trnType } = this.props;
    if (this.context.activityFieldsManager.isFieldPathByPartsEnabled(AC.FUNDINGS, trnType)) {
      const fundingDetails = this.props.funding[trnType];
      // TODO: Add the extra data in header (when there are funding details).
      let header = '';
      let button = '';
      let open = false;
      switch (this.props.trnType) {
        case AC.COMMITMENTS:
          header = translate('Commitments');
          button = translate('Add Commitments');
          open = this.props.funding.commitmentsStatusOpen;
          break;
        case AC.DISBURSEMENTS:
          header = translate('Disbursements');
          button = translate('Add Disbursements');
          open = this.props.funding.disbursementsStatusOpen;
          break;
        case AC.EXPENDITURES:
          header = translate('Expenditures');
          button = translate('Add Expenditures');
          open = this.props.funding.expendituresStatusOpen;
          break;
        default:
          break;
      }
      // const hasErrors = this.hasErrors(this.props.fundingDetail, this.props.type);
      return (<div>
        <Panel
          header={header} collapsible expanded={open}
          onSelect={() => {
            this._setOpenStatus(this.props.trnType, !open);
            this.setState({ refresh: Math.random() });
          }} className={this.state.errors ? fundingStyles.error : ''}>
          {fundingDetails.map((fd) => {
            // Add a temporal_id field so we can delete items.
            if (!fd[AC.TEMPORAL_ID]) {
              fd[AC.TEMPORAL_ID] = Utils.numberRandom();
            }
            /* Lesson learned: DO NOT use an array index as component key if later we will remove elements from
            that array because that will confuse React. */
            return (<AFFundingDetailItem
              fundingDetail={fd} trnType={trnType} key={`${header}_${fd[AC.TEMPORAL_ID]}`}
              removeFundingDetailItem={this.props.removeFundingDetailItem} funding={this.props.funding}
              updateParentErrors={this._onChildUpdate} />);
          })}
          <Button
            className={fundingStyles.add_button} bsStyle="primary"
            onClick={this._addTransactionItem.bind(this)}>{button}
          </Button>
        </Panel>
      </div>);
    } else {
      return null;
    }
  }
}
