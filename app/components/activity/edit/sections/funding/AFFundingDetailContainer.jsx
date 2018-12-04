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
    fundingDetail: PropTypes.array.isRequired,
    type: PropTypes.string.isRequired,
    handleNewTransaction: PropTypes.func.isRequired,
    removeFundingDetailItem: PropTypes.func.isRequired,
    hasErrors: PropTypes.func.isRequired,
    funding: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    const errors = this.hasErrors(props.fundingDetail, props.type);
    const openFDC = errors || props.funding.open;
    this.state = {
      openFDC,
      errors
    };
    this._onChildUpdate = this._onChildUpdate.bind(this);
  }

  hasErrors(fundingDetail, type) {
    const fundingDetails = fundingDetail.filter(fd => (fd[AC.TRANSACTION_TYPE]
      && fd[AC.TRANSACTION_TYPE].value === type));
    return this.props.hasErrors(fundingDetails);
  }

  _addTransactionItem() {
    this.props.handleNewTransaction(this.props.type);
  }

  _onChildUpdate() {
    this.setState({ errors: this.hasErrors(this.props.fundingDetail, this.props.type) });
  }

  render() {
    const transactionTypes = Object.values(this.context.activityFieldsManager
      .possibleValuesMap[`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.TRANSACTION_TYPE}`]);
    if (transactionTypes.find(item => (item.value === this.props.type))) {
      const fundingDetails = this.props.fundingDetail.filter(fd => (fd[AC.TRANSACTION_TYPE]
        && fd[AC.TRANSACTION_TYPE].value === this.props.type));
      // TODO: Add the extra data in header (when there are funding details).
      let header = '';
      let button = '';
      switch (this.props.type) {
        case VC.COMMITMENTS:
          header = translate('Commitments');
          button = translate('Add Commitments');
          break;
        case VC.DISBURSEMENTS:
          header = translate('Disbursements');
          button = translate('Add Disbursements');
          break;
        case VC.EXPENDITURES:
          header = translate('Expenditures');
          button = translate('Add Expenditures');
          break;
        default:
          break;
      }
      // const hasErrors = this.hasErrors(this.props.fundingDetail, this.props.type);
      return (<div>
        <Panel
          header={header} collapsible expanded={this.state.openFDC}
          onSelect={() => {
            this.props.funding.open = !this.state.openFDC;
            this.setState({ openFDC: !this.state.openFDC });
          }} className={this.state.errors ? fundingStyles.error : ''}>
          {fundingDetails.map((fd) => {
            // Add a temporal_id field so we can delete items.
            if (!fd[AC.TEMPORAL_ID]) {
              fd[AC.TEMPORAL_ID] = Utils.numberRandom();
            }
            /* Lesson learned: DO NOT use an array index as component key if later we will remove elements from
            that array because that will confuse React. */
            return (<AFFundingDetailItem
              fundingDetail={fd} type={this.props.type} key={`${header}_${fd[AC.TEMPORAL_ID]}`}
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
