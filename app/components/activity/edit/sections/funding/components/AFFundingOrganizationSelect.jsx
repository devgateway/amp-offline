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
    activity: PropTypes.object.isRequired,
    handleDonorSelect: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  _handleDonorSelect(value) {
    LoggerManager.log('_handleDonorSelect');
    this.props.handleDonorSelect(value);
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
