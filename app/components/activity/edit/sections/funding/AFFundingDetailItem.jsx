/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';
import AFField from '../../components/AFField';
import * as AF from '../../components/AFComponentTypes';

/**
 * @author Gabriel Inchauspe
 */
export default class AFFundingDetailItem extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  static propTypes = {
    fundingDetail: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    return (<div>
      <AFField
        parent={this.props.fundingDetail}
        fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.ADJUSTMENT_TYPE}`} />
      <AFField
        parent={this.props.fundingDetail}
        fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.TRANSACTION_AMOUNT}`} type={AF.NUMBER} />
      <AFField
        parent={this.props.fundingDetail}
        fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.CURRENCY}`} />
      <AFField
        parent={this.props.fundingDetail}
        fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.TRANSACTION_DATE}`} />
    </div>);
  }
}
