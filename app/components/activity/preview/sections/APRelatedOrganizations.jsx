/* eslint-disable react/no-unused-prop-types,class-methods-use-this */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Section from './Section';
import {
  ADDITIONAL_INFO,
  DONOR_ORGANIZATION,
  EXECUTING_AGENCY,
  CONTRACTING_AGENCY,
  BENEFICIARY_AGENCY,
  IMPLEMENTING_AGENCY,
  RESPONSIBLE_ORGANIZATION,
  ORGANIZATION,
  PERCENTAGE, HIERARCHICAL_VALUE,
  SECTOR_GROUP, REGIONAL_GROUP
} from '../../../../utils/constants/ActivityConstants';
import APPercentageList from '../components/APPercentageList';
import FieldsManager from '../../../../modules/field/FieldsManager';
import { ACTIVITY_ORGANIZATIONS_DONOR_ORGANIZATION } from '../../../../utils/constants/FeatureManagerConstants';

const DO = APPercentageList(DONOR_ORGANIZATION, ORGANIZATION, PERCENTAGE, 'Donor Organization');
const RO = APPercentageList(RESPONSIBLE_ORGANIZATION, ORGANIZATION, PERCENTAGE, 'Responsible Organization');
const CA = APPercentageList(CONTRACTING_AGENCY, ORGANIZATION, PERCENTAGE, 'Contracting Agency');
const BA = APPercentageList(BENEFICIARY_AGENCY, ORGANIZATION, PERCENTAGE, 'Beneficiary Agency');
const IA = APPercentageList(IMPLEMENTING_AGENCY, ORGANIZATION, PERCENTAGE, 'Implementing Agency');
const EA = APPercentageList(EXECUTING_AGENCY, ORGANIZATION, PERCENTAGE, 'Executing Agency');
const RG = APPercentageList(REGIONAL_GROUP, ORGANIZATION, PERCENTAGE, 'Regional Group');
const SG = APPercentageList(SECTOR_GROUP, ORGANIZATION, PERCENTAGE, 'Sector Group');

/**
 * @author Gabriel Inchauspe
 */
class APRelatedOrganizations extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired
  };

  getItemTitle(item) {
    const org = item[ORGANIZATION];
    const orgTitle = org[HIERARCHICAL_VALUE] ? org[HIERARCHICAL_VALUE] : org.value;
    const additionalInfo = item[ADDITIONAL_INFO];
    if (additionalInfo) {
      return `${orgTitle} (${additionalInfo})`;
    }
    return orgTitle;
  }

  render() {
    const porps = { ...this.props, getItemTitle: this.getItemTitle };
    return (<div>
      <DO key="do-org-list" {...porps} fmPath={ACTIVITY_ORGANIZATIONS_DONOR_ORGANIZATION} />
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
