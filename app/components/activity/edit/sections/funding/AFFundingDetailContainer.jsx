/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { Panel, Button } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';
import translate from '../../../../../utils/translate';
import AFFundingDetailItem from './AFFundingDetailItem';

/**
 * @author Gabriel Inchauspe
 */
export default class AFFundingDetailContainer extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  static propTypes = {
    funding: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.state = {
      openFDC: false
    };
  }

  render() {
    const fundingDetails = this.props.funding[AC.FUNDING_DETAILS]
      .filter(fd => (fd[AC.TRANSACTION_TYPE].value === this.props.type));
    if (fundingDetails.length > 0) {
      // TODO: Add the extra data in header (when there are funding details).
      let header = '';
      switch (this.props.type) {
        case VC.COMMITMENTS:
          header = translate('Commitments');
          break;
        case VC.DISBURSEMENTS:
          header = translate('Disbursements');
          break;
        case VC.EXPENDITURES:
          header = translate('Expenditures');
          break;
        default:
          break;
      }
      // TODO: poner una key a los elementos del map (ojo, no viene el id del fd).
      return (<div>
        <Panel
          header={header} collapsible expanded={this.state.openFDC}
          onSelect={() => {
            this.setState({ openFDC: !this.state.openFDC });
          }}>
          {fundingDetails.map(fd => (<AFFundingDetailItem fundingDetail={fd} type={this.props.type} />))}
          <Button bsStyle="primary">{translate(`${translate('Add')} ${translate(this.props.type)}`)}</Button>
        </Panel>
      </div>);
    } else {
      return null;
    }
  }
}
