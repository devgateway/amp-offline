/**
 * Activity funding totals helper
 * @author Nadejda Mandrescu
 */
export default class ActivityFundingTotals {
  constructor(activity, activityFieldsManager) {
    this._activityFieldsManager = activityFieldsManager;
    // caches a structure of totals by adj and then trn type for specified filter (that can be empty for global totals)
    this._filteredTotals = {};
  }

  getTotals(adjType, trnType, filter) {
    let value = this._getTotalFromCacheOrInitCache(adjType, trnType, filter);
    if (value === undefined) {
      value = this._buildTotalAndCacheIt(adjType, trnType, filter);
    }
    return value;
  }

  _getTotalFromCacheOrInitCache(adjType, trnType, filter) {
    let cached = this._filteredTotals[adjType];
    if (cached) {
      cached = cached[trnType];
      if (cached) {
        cached = cached[filter];
      } else {
        this._filteredTotals[adjType][trnType] = {};
      }
    } else {
      this._filteredTotals[adjType] = { trnType: {} };
    }
    return cached;
  }

  _buildTotalAndCacheIt(adjType, trnType, filter) {
    const cache = this._filteredTotals[adjType][trnType];
    // TODO calculate once currency conversion support is available
    const value = '0 USD';
    cache[filter] = value;
    return value;
  }
}
