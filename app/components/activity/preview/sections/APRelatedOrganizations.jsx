/* eslint-disable react/no-unused-prop-types */
import React, { Component, PropTypes } from 'react';
import Section from './Section';
import {
  DONOR_ORGANIZATION,
  EXECUTING_AGENCY,
  CONTRACTING_AGENCY,
  BENEFICIARY_AGENCY,
  IMPLEMENTING_AGENCY,
  RESPONSIBLE_ORGANIZATION,
  ORGANIZATION,
  PERCENTAGE
} from '../../../../utils/constants/ActivityConstants';
import APPercentageList from '../components/APPercentageList';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';

const DO = APPercentageList(DONOR_ORGANIZATION, ORGANIZATION, PERCENTAGE, 'Donor Organization');
const RO = APPercentageList(RESPONSIBLE_ORGANIZATION, ORGANIZATION, PERCENTAGE, 'Responsible Organization');
const CA = APPercentageList(CONTRACTING_AGENCY, ORGANIZATION, PERCENTAGE, 'Contracting Agency');
const BE = APPercentageList(BENEFICIARY_AGENCY, ORGANIZATION, PERCENTAGE, 'Beneficiary Agency');
const IE = APPercentageList(IMPLEMENTING_AGENCY, ORGANIZATION, PERCENTAGE, 'Implementing Agency');
const EA = APPercentageList(EXECUTING_AGENCY, ORGANIZATION, PERCENTAGE, 'Executing Agency');

/**
 * @author Gabriel Inchauspe
 */
class APRelatedOrganizations extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  render() {
    return (<div>
      <DO key="do-org-list" {...this.props} />
      <RO key="ro-org-list" {...this.props} />
      <CA key="ca-org-list" {...this.props} />
      <BE key="be-org-list" {...this.props} />
      <IE key="ie-org-list" {...this.props} />
      <EA key="ea-org-list" {...this.props} />
    </div>);
  }
}

export default Section(APRelatedOrganizations, 'Related Organizations', true, 'APRelatedOrganizations');
