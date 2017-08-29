/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../../../../../modules/util/LoggerManager';
import AFField from '../../../components/AFField';
import * as AC from '../../../../../../utils/constants/ActivityConstants';

/**
 * Funding Section
 * @author Gabriel Inchauspe
 */
export default class AFFundingOrganizationSelect extends Component {

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.state = {
      fundingList: this.props.activity.fundings
    };
  }

  _handleDonorSelect(value) {
    LoggerManager.log('_handleDonorSelect');
    // TODO: ver si tengo q sacar el nuevo org de la tabla.
    // TODO: insertar en this.context.activity o this.props.activity el nuevo funding.
    const fundingItem = {};
    fundingItem[AC.FUNDING_DONOR_ORG_ID] = {
      id: value._id,
      value: value._value,
      extra_info: value.extra_info,
      'translated-value': value['translated-value']
    };
    fundingItem[AC.SOURCE_ROLE] = { id: 1, value: 'Donor' };
    fundingItem[AC.FUNDING_DETAILS] = [];
    fundingItem[AC.GROUP_VERSIONED_FUNDING] = Math.random();
    fundingItem[AC.AMP_FUNDING_ID] = Math.random();
    const newFundingList = this.state.fundingList;
    newFundingList.push(fundingItem);
    this.setState({ fundingList: newFundingList });
  }

  render() {
    return (<div>
      <div>
        Esto funca relativamente bien: deja lo elegido, devuelve ese solo y me lo agrega a la lista de donor
        organizations.
        <AFField
          parent={this.props.activity} fieldPath={'donor_organization~organization'}
          listParams={{ 'no-table': true }} onAfterUpdate={this._handleDonorSelect.bind(this)} />
      </div>
    </div>);
  }
}
