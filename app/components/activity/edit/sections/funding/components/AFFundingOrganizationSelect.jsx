/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import * as AC from '../../../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../../../utils/constants/ValueConstants';
import LoggerManager from '../../../../../../modules/util/LoggerManager';
import translate from '../../../../../../utils/translate';
import AFField from '../../../components/AFField';

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
  }

  render() {
    return (<div>
      <div>{translate('Search Funding Organizations')}</div>
      <div>
        <AFField parent={this.props.activity} fieldPath={'organization_group'} listParams={{ 'no-table': true }} />
        <AFField parent={this.props.activity} fieldPath={AC.DONOR_ORGANIZATION} listParams={{ 'no-table': true }} />
      </div>
    </div>);
  }
}
