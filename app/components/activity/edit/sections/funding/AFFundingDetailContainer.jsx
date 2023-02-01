/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { Button, Panel } from 'react-bootstrap';
import { ActivityConstants, FieldsManager, UIUtils } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import AFFundingDetailItem from './AFFundingDetailItem';
import fundingStyles from './AFFundingContainer.css';
import styles from "./AFFunding.css";

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
    funding: PropTypes.object.isRequired
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
    this._setOpenStatus = this._setOpenStatus.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const errors = this.hasErrors(nextProps.funding, nextProps.trnType);
    this.setState({ errors });
  }

  hasErrors(funding, trnType) {
    return this.props.hasErrors(funding[trnType]);
  }

  _setOpenStatus(trnType, value) {
    switch (trnType) {
      case ActivityConstants.COMMITMENTS:
        this.props.funding.commitmentsStatusOpen = value;
        break;
      case ActivityConstants.DISBURSEMENTS:
        this.props.funding.disbursementsStatusOpen = value;
        break;
      case ActivityConstants.EXPENDITURES:
        this.props.funding.expendituresStatusOpen = value;
        break;
      default:
        break;
    }
  }

  _addTransactionItem() {
    this.props.handleNewTransaction(this.props.trnType);
  }

  render() {
    const { trnType } = this.props;
    if (this.context.activityFieldsManager.isFieldPathByPartsEnabled(ActivityConstants.FUNDINGS, trnType)) {
      const fundingDetails = this.props.funding[trnType] || [];
      // TODO: Add the extra data in header (when there are funding details).
      let header = '';
      let button = '';
      let open = false;
      switch (this.props.trnType) {
        case ActivityConstants.COMMITMENTS:
          header = translate('Commitments');
          button = translate('Add Commitments');
          open = this.props.funding.commitmentsStatusOpen;
          break;
        case ActivityConstants.DISBURSEMENTS:
          header = translate('Disbursements');
          button = translate('Add Disbursements');
          open = this.props.funding.disbursementsStatusOpen;
          break;
        case ActivityConstants.EXPENDITURES:
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
          key={Math.random()} defaultExpanded
          onSelect={() => {
            this._setOpenStatus(this.props.trnType, !open);
            //this.setState({ refresh: Math.random() });
          }} className={this.state.errors ? fundingStyles.error : ''}>
          <Panel.Heading>
            <Panel.Title toggle>{header}</Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
              {fundingDetails.map((fd) => {
                // Add a temporal_id field so we can delete items.
                if (!fd[ActivityConstants.TEMPORAL_ID]) {
                  fd[ActivityConstants.TEMPORAL_ID] = UIUtils.numberRandom();
                }
                /* Lesson learned: DO NOT use an array index as component key if later we will remove elements from
                that array because that will confuse React. */
                return (<AFFundingDetailItem
                  fundingDetail={fd} trnType={trnType} key={`${header}_${fd[ActivityConstants.TEMPORAL_ID]}`}
                  removeFundingDetailItem={this.props.removeFundingDetailItem} funding={this.props.funding} />);
              })}
              <Button
                className={fundingStyles.add_button} bsStyle="primary"
                onClick={this._addTransactionItem.bind(this)}>{button}
              </Button>
            </Panel.Body></Panel.Collapse>
        </Panel>
      </div>);
    } else {
      return null;
    }
  }
}
