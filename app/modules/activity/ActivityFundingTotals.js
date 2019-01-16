import NumberUtils from '../../utils/NumberUtils';
import * as AC from '../../utils/constants/ActivityConstants';

/**
 * Activity funding totals helper
 * @author Nadejda Mandrescu
 */
export default class ActivityFundingTotals {
  constructor(activity, activityFieldsManager, currentWorkspaceSettings, currencyRatesManager) {
    this._activity = activity;
    this._activityFieldsManager = activityFieldsManager;
    this._currentWorkspaceSettings = currentWorkspaceSettings;
    this._currencyRatesManager = currencyRatesManager;
    // caches a structure of totals by adj and then trn type for specified filter (that can be empty for global totals)
    this._filteredTotals = {};
  }

  getComputedTotals(measureName, filter) {
    return this._getTotals(filter, [measureName]);
  }

  getTotals(adjType, trnType, filter = {}) {
    return this._getTotals(filter, [adjType, trnType]);
  }

  getMTEFTotal() {
    let total = 0;
    if (this._activity.fundings) {
      this._activity.fundings.forEach(f => {
        if (f[AC.MTEF_PROJECTIONS]) {
          f[AC.MTEF_PROJECTIONS].forEach(mtef => {
            total += this._currencyRatesManager.convertAmountToCurrency(mtef[AC.AMOUNT], mtef[AC.CURRENCY].value,
              mtef[AC.PROJECTION_DATE], 0, this._currentWorkspaceSettings.currency.code);
          });
        }
      });
    }
    total = this.formatAmount(total);
    return total;
  }

  _getTotals(filter, path) {
    let value = this._getTotalFromCacheOrInitCache(this._filteredTotals, filter, path, 0);
    if (value === undefined) {
      value = this._buildTotalAndCacheIt(filter, path);
    }
    return value;
  }

  _getTotalFromCacheOrInitCache(cached, filter, path, index) {
    const part = path[index];
    let existing = cached[part];
    if (!existing) {
      existing = {};
      cached[part] = existing;
    }
    if (path.length === index + 1) {
      return existing[filter];
    }
    return this._getTotalFromCacheOrInitCache(existing, filter, path, index + 1);
  }

  _buildTotalAndCacheIt(filter, path) {
    let cache = this._filteredTotals;
    path.forEach(part => {
      cache = cache[part];
    });
    let value = 0;
    if (path.length === 2) {
      value = this._buildStandardMeasureTotal(filter, path[0], path[1]);
    }
    cache[filter] = value;
    return value;
  }

  /**
   * Builds donor funding totoals
   * @param filter
   * @param adjType
   * @param trnType
   * @return {number}
   * @private
   */
  _buildStandardMeasureTotal(filter, adjType, trnType) {
    // TODO apply filter as well
    const fundingDetails = [];
    if (this._activity.fundings) {
      this._activity.fundings.forEach(funding => {
        const fds = funding[trnType] && funding[trnType].filter(fd => fd[AC.ADJUSTMENT_TYPE].id === adjType);
        if (fds && fds.length) {
          fundingDetails.push(...fds);
        }
      });
    }
    let total = 0;
    if (fundingDetails.length > 0) {
      total = this._currencyRatesManager.convertFundingDetailsToCurrency(fundingDetails,
        this._currentWorkspaceSettings.currency.code);
    }

    return total;
  }

  formatAmount(amount, isPercentage = false) {
    let value = NumberUtils.rawNumberToFormattedString(amount);
    if (isPercentage) {
      return `${value}%`;
    }
    value = value.toLocaleString('en-EN', {
      currency: this._currentWorkspaceSettings.currency.code,
      currencyDisplay: 'code'
    });
    return value;
  }
}
