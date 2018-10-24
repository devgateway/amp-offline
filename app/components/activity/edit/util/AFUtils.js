import * as AC from '../../../../utils/constants/ActivityConstants';
import Utils from '../../../../utils/Utils';
import FeatureManager from '../../../../modules/util/FeatureManager';
import * as FMC from '../../../../utils/constants/FeatureManagerConstants';
import PossibleValuesManager from '../../../../modules/field/PossibleValuesManager';

const orgTypes = {
  [AC.BENEFICIARY_AGENCY]: { constant: 'BENEFICIARY_AGENCY', name: 'Beneficiary Agency' },
  [AC.CONTRACTING_AGENCY]: { constant: 'CONTRACTING_AGENCY', name: 'Contracting Agency' },
  [AC.DONOR_ORGANIZATION]: { constant: 'DONOR_ORGANIZATION', name: ['Donor Organization', 'Donor'] },
  [AC.EXECUTING_AGENCY]: { constant: 'EXECUTING_AGENCY', name: 'Executing Agency' },
  [AC.IMPLEMENTING_AGENCY]: { constant: 'IMPLEMENTING_AGENCY', name: 'Implementing Agency' },
  [AC.REGIONAL_GROUP]: { constant: 'REGIONAL_GROUP', name: 'Regional Group' },
  [AC.RESPONSIBLE_ORGANIZATION]: { constant: 'RESPONSIBLE_ORGANIZATION', name: 'Responsible Organization' },
  [AC.SECTOR_GROUP]: { constant: 'SECTOR_GROUP', name: 'Sector Group' }
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
    fundingItem[AC.FUNDING_DONOR_ORG_ID] = {
      id: org.id,
      value: org.value,
      extra_info: org.extra_info,
      'translated-value': org['translated-value']
    };
    fundingItem[AC.FUNDING_DETAILS] = [];
    fundingItem[AC.GROUP_VERSIONED_FUNDING] = Utils.numberRandom();
    fundingItem[AC.AMP_FUNDING_ID] = Utils.numberRandom();
    // Find the 'Donor' org type if enabled.
    if (activityFieldsManager.isFieldPathEnabled(`${AC.FUNDINGS}~${AC.SOURCE_ROLE}`)) {
      const donorList = activityFieldsManager.possibleValuesMap[`${AC.FUNDINGS}~${AC.SOURCE_ROLE}`];
      fundingItem[AC.SOURCE_ROLE] = Object.values(donorList).find(item => item.value === orgName);
    }
    if (activityFieldsManager.isFieldPathEnabled(`${AC.FUNDINGS}~${AC.MTEF_PROJECTIONS}`)) {
      fundingItem[AC.MTEF_PROJECTIONS] = [];
    }
    return fundingItem;
  },

  checkIfAutoAddFundingEnabled(orgTypeCode) {
    const orgTypeConstantName = orgTypes[orgTypeCode].constant;
    const fmc = `ACTIVITY_ORGANIZATIONS_${orgTypeConstantName}_ADD_FUNDING_AUTO`;
    return FeatureManager.isFMSettingEnabled(FMC[fmc]);
  },

  checkIfOrganizationAndOrgTypeHasFunding(orgTypeName, organization, activityFieldsManager, activity) {
    const fundingList = activity[AC.FUNDINGS] || [];
    const sourceRoleOn = activityFieldsManager.isFieldPathEnabled(`${AC.FUNDINGS}~${AC.SOURCE_ROLE}`);
    return fundingList.find(f => (f[AC.FUNDING_DONOR_ORG_ID].id === organization.id
      && (sourceRoleOn ? f[AC.SOURCE_ROLE].value === orgTypeName : true)));
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
