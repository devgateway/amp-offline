import * as AC from '../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../utils/constants/ValueConstants';
import Utils from '../../../../utils/Utils';

const AFUtils = {

  /**
   * Common function used in AFOrganizations and AFFunding.
   * @param activityFieldsManager
   * @param org
   */
  createFundingItem(activityFieldsManager, org) {
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
      fundingItem[AC.SOURCE_ROLE] = Object.values(donorList).find(item => item.value === VC.DONOR_AGENCY);
    }
    return fundingItem;
  }

};

module.exports = AFUtils;
