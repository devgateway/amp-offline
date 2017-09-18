/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { Button, Panel } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';
import translate from '../../../../../utils/translate';
import AFFundingDetailItem from './AFFundingDetailItem';
import * as Utils from '../../../../../utils/Utils';

/**
 * @author Gabriel Inchauspe
 */
export default class AFFundingDetailContainer extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  static propTypes = {
    fundingDetail: PropTypes.array.isRequired,
    type: PropTypes.string.isRequired,
    handleNewTransaction: PropTypes.func.isRequired,
    removeFundingDetailItem: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.state = {
      openFDC: false
    };
  }

  _addTransactionItem() {
    this.props.handleNewTransaction(this.props.type);
  }

  render() {
    if (this.props.fundingDetail.length > 0) {
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
      return (<div>
        <Panel
          header={header} collapsible expanded={this.state.openFDC}
          onSelect={() => {
            this.setState({ openFDC: !this.state.openFDC });
          }}>
          {this.props.fundingDetail.map((fd) => {
            // Add a temporal_id field so we can delete items.
            if (!fd[AC.TEMPORAL_ID]) {
              fd[AC.TEMPORAL_ID] = Utils.numberRandom();
            }
            return (<AFFundingDetailItem
              fundingDetail={fd} type={this.props.type} key={`${header}_${fd[AC.TEMPORAL_ID]}`}
              removeFundingDetailItem={this.props.removeFundingDetailItem} />);
          })}
          <Button bsStyle="primary" onClick={this._addTransactionItem.bind(this)}>{button}</Button>
        </Panel>
      </div>);
    } else {
      return null;
    }
  }
}
