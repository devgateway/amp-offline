import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';
import { FieldsManager } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
import AFRegionalFundingFundingDetailItem from './AFRegionalFundingFundingDetailItem';

const logger = new Logger('AF regional funding funding type section');

export default class AFRegionalFundingFundingTypeSection extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    activity: PropTypes.object.isRequired,
    activityFundingSectionPanelStatus: PropTypes.array.isRequired
  };

  static propTypes = {
    type: PropTypes.string.isRequired,
    location: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
  };

  render() {
    const { title, location, type } = this.props;
    return (<Panel header={title} collapsible>
      <AFRegionalFundingFundingDetailItem location={location} type={type} />
    </Panel>);
  }
}
