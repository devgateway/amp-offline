/* eslint-disable react/no-unused-prop-types,class-methods-use-this */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityConstants, FeatureManagerConstants, FieldsManager } from 'amp-ui';
import Section from './Section';
import APPercentageList from '../components/APPercentageList';

const DO = APPercentageList(ActivityConstants.DONOR_ORGANIZATION, ActivityConstants.ORGANIZATION,
  ActivityConstants.PERCENTAGE, 'Donor Organization');
const RO = APPercentageList(ActivityConstants.RESPONSIBLE_ORGANIZATION, ActivityConstants.ORGANIZATION,
  ActivityConstants.PERCENTAGE, 'Responsible Organization');
const CA = APPercentageList(ActivityConstants.CONTRACTING_AGENCY, ActivityConstants.ORGANIZATION,
  ActivityConstants.PERCENTAGE, 'Contracting Agency');
const BA = APPercentageList(ActivityConstants.BENEFICIARY_AGENCY, ActivityConstants.ORGANIZATION,
  ActivityConstants.PERCENTAGE, 'Beneficiary Agency');
const IA = APPercentageList(ActivityConstants.IMPLEMENTING_AGENCY, ActivityConstants.ORGANIZATION,
  ActivityConstants.PERCENTAGE, 'Implementing Agency');
const EA = APPercentageList(ActivityConstants.EXECUTING_AGENCY, ActivityConstants.ORGANIZATION,
  ActivityConstants.PERCENTAGE, 'Executing Agency');
const RG = APPercentageList(ActivityConstants.REGIONAL_GROUP, ActivityConstants.ORGANIZATION,
  ActivityConstants.PERCENTAGE, 'Regional Group');
const SG = APPercentageList(ActivityConstants.SECTOR_GROUP, ActivityConstants.ORGANIZATION,
  ActivityConstants.PERCENTAGE, 'Sector Group');

/**
 * @author Gabriel Inchauspe
 */
class APRelatedOrganizations extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired
  };

  getItemTitle(item) {
    const org = item[ActivityConstants.ORGANIZATION];
    const orgTitle = org[ActivityConstants.HIERARCHICAL_VALUE] ? org[ActivityConstants.HIERARCHICAL_VALUE] : org.value;
    const additionalInfo = item[ActivityConstants.ADDITIONAL_INFO];
    if (additionalInfo) {
      return `${orgTitle} (${additionalInfo})`;
    }
    return orgTitle;
  }

  render() {
    const porps = { ...this.props, getItemTitle: this.getItemTitle };
    return (<div>
      <DO key="do-org-list" {...porps} fmPath={FeatureManagerConstants.ACTIVITY_ORGANIZATIONS_DONOR_ORGANIZATION} />
      <RO key="ro-org-list" {...porps} />
      <EA key="ea-org-list" {...porps} />
      <IA key="ie-org-list" {...porps} />
      <BA key="be-org-list" {...porps} />
      <CA key="ca-org-list" {...porps} />
      <RG key="rg-org-list" {...porps} />
      <SG key="sg-org-list" {...porps} />
    </div>);
  }
}

export default Section(APRelatedOrganizations, 'Related Organizations', true, 'APRelatedOrganizations');
