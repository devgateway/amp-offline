// esto es todo un funding para un donor (encabezado mas fd).

import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import APField from '../../components/APField';

/**
 * @author Gabriel Inchauspe
 */
class APFundingOrganizationSection extends Component {

  static propTypes = {
    funding: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  _buildSection() {
    const content = [];
    content.push(APField.instance('Organization Name', this.props.funding[AC.FUNDING_DONOR_ORG_ID].value, true, false));
    content.push(APField.instance('Organization Role', this.props.funding[AC.SOURCE_ROLE].value, true, false));
    content.push(APField.instance('Type of Assistance', this.props.funding[AC.TYPE_OF_ASSISTANCE].value, true, false));
    return content;
  }

  render() {
    return <div>{this._buildSection()}</div>;
  }
}

export default APFundingOrganizationSection;
