import { ActivityConstants, FeatureManagerConstants, FeatureManager, PossibleValuesManager, UIUtils } from 'amp-ui';

const orgTypes = {
  [ActivityConstants.BENEFICIARY_AGENCY]: { constant: 'BENEFICIARY_AGENCY', name: 'Beneficiary Agency' },
  [ActivityConstants.CONTRACTING_AGENCY]: { constant: 'CONTRACTING_AGENCY', name: 'Contracting Agency' },
  [ActivityConstants.DONOR_ORGANIZATION]: { constant: 'DONOR_ORGANIZATION', name: ['Donor Organization', 'Donor'] },
  [ActivityConstants.EXECUTING_AGENCY]: { constant: 'EXECUTING_AGENCY', name: 'Executing Agency' },
  [ActivityConstants.IMPLEMENTING_AGENCY]: { constant: 'IMPLEMENTING_AGENCY', name: 'Implementing Agency' },
  [ActivityConstants.REGIONAL_GROUP]: { constant: 'REGIONAL_GROUP', name: 'Regional Group' },
  [ActivityConstants.RESPONSIBLE_ORGANIZATION]: { constant: 'RESPONSIBLE_ORGANIZATION',
    name: 'Responsible Organization' },
  [ActivityConstants.SECTOR_GROUP]: { constant: 'SECTOR_GROUP', name: 'Sector Group' }
};

const AFUtils = {

  /**
   * Common function used in AFOrganizations and AFFunding.
   * @param activityFieldsManager
   * @param org
   * @param orgName
   */
  createFundingItem(activityFieldsManager, org, orgName) {
    const fundingItem = {};
    fundingItem[ActivityConstants.FUNDING_DONOR_ORG_ID] = {
      id: org.id,
      value: org.value,
      extra_info: org.extra_info,
      'translated-value': org['translated-value']
    };
    fundingItem[ActivityConstants.GROUP_VERSIONED_FUNDING] = UIUtils.numberRandom();
    fundingItem[ActivityConstants.AMP_FUNDING_ID] = UIUtils.numberRandom();
    // Find the 'Donor' org type if enabled.
    if (activityFieldsManager
      .isFieldPathEnabled(`${ActivityConstants.FUNDINGS}~${ActivityConstants.SOURCE_ROLE}`)) {
      const donorList = activityFieldsManager
        .possibleValuesMap[`${ActivityConstants.FUNDINGS}~${ActivityConstants.SOURCE_ROLE}`];
      fundingItem[ActivityConstants.SOURCE_ROLE] = Object.values(donorList)
        .find(item => item.value === orgName);
    }
    if (activityFieldsManager
      .isFieldPathEnabled(`${ActivityConstants.FUNDINGS}~${ActivityConstants.MTEF_PROJECTIONS}`)) {
      fundingItem[ActivityConstants.MTEF_PROJECTIONS] = [];
    }
    return fundingItem;
  },

  checkIfAutoAddFundingEnabled(orgTypeCode) {
    const orgTypeConstantName = orgTypes[orgTypeCode].constant;
    const fmc = `ACTIVITY_ORGANIZATIONS_${orgTypeConstantName}_ADD_FUNDING_AUTO`;
    return FeatureManager.isFMSettingEnabled(FeatureManagerConstants[fmc]);
  },

  checkIfOrganizationAndOrgTypeHasFunding(orgTypeName, organization, activityFieldsManager, activity) {
    const fundingList = activity[ActivityConstants.FUNDINGS] || [];
    const sourceRoleOn = activityFieldsManager
      .isFieldPathEnabled(`${ActivityConstants.FUNDINGS}~${ActivityConstants.SOURCE_ROLE}`);
    return fundingList.find(f => (f[ActivityConstants.FUNDING_DONOR_ORG_ID].id === organization.id
      && (sourceRoleOn ? f[ActivityConstants.SOURCE_ROLE].value === orgTypeName : true)));
  },

  findOrgTypeByCode(code) {
    return orgTypes[code];
  },

  findOrgTypeCodeByName(name) {
    const index = Object.values(orgTypes).findIndex(o => (o.name === name
      || (o.name instanceof Array ? (o.name.find(o2 => o2 === name)) : false)));
    return Object.keys(orgTypes)[index];
  },

  getDefaultOrFirstUsableCurrency(options, defaultCurrencyCode, currencyRatesManager) {
    const currencyOption = options.find(o => o.value === defaultCurrencyCode);
    if (PossibleValuesManager.isCurrencyOptionUsable(currencyOption, currencyRatesManager)) {
      return currencyOption;
    }
    options = options.sort((a, b) => a.value.localeCompare(b.value));
    return options.find(o => PossibleValuesManager.isCurrencyOptionUsable(o, currencyRatesManager));
  }

};

module.exports = AFUtils;
