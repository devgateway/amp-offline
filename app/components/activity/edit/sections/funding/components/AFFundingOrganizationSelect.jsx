/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import Logger from '../../../../../../modules/util/LoggerManager';
import AFField from '../../../components/AFField';
import { DONOR_ORGANIZATIONS_PATH } from '../../../../../../utils/constants/FieldPathConstants';

const logger = new Logger('AP Funding Organization select');

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
    logger.debug('constructor');
  }

  _handleDonorSelect(value) {
    logger.debug('_handleDonorSelect');
    this.props.handleDonorSelect(value);
  }

  render() {
    return (<div>
      <div>
        <AFField
          parent={this.props.activity} fieldPath={DONOR_ORGANIZATIONS_PATH}
          extraParams={{ 'no-table': true }} onAfterUpdate={this._handleDonorSelect.bind(this)} />
      </div>
    </div>);
  }
}
