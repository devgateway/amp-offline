import {
  HIERARCHICAL_VALUE_DEPTH
} from '../../utils/constants/ActivityConstants';
import store from '../../index';
import LoggerManager from '../../modules/util/LoggerManager';

/**
 * Possible Values manager that allows to fill in additional information and tranformations
 * @author Nadejda Mandrescu
 */
const PossibleValuesManager = {
  /**
   * Builds tree set of ids from the parentId
   * This implementation is based on the current locations extra info approach and can change.
   */
  expandParentWithChildren(options, parentId) {
    LoggerManager.log('expandParentWithChildren');
    if (parentId === undefined || parentId === null) {
      return null;
    }
    const ids = new Set();
    let idsToExpand = [parentId];
    while (idsToExpand.length > 0) {
      const nextId = idsToExpand.pop();
      if (!ids.has(nextId)) {
        ids.add(nextId);
        const newIds = options
          .filter(o => o.extra_info && o.extra_info.parent_location_id && o.extra_info.parent_location_id === nextId)
          .map(o => o.id);
        idsToExpand = idsToExpand.concat(newIds);
      }
    }
    return ids;
  },

  // TODO update with AMPOFFLINE-303
  /**
   * Fills hierarchical depth of each option
   * @param options
   */
  fillHierarchicalDepth(options) {
    options.forEach(option => {
      this._fillHierarchicalDepth(options, option);
    });
    return options;
  },

  _fillHierarchicalDepth(options, option) {
    if (!option) {
      LoggerManager.error(`option is unspecified: ${option}`);
      return 0;
    }
    let depth = option[HIERARCHICAL_VALUE_DEPTH];
    if (depth === undefined) {
      // So far it is based on the current locations extra info approach
      if (option.extra_info && option.extra_info.parent_location_id) {
        const parent = options.find(o => o.id === option.extra_info.parent_location_id);
        depth = 1 + this._fillHierarchicalDepth(options, parent);
      } else {
        depth = 0;
      }
      option[HIERARCHICAL_VALUE_DEPTH] = depth;
    }
    return depth;
  },

  findOption(options, id) {
    return Object.values(options).find(o => o.id === id);
  },

  getOptionTranslation(option) {
    let resVal = option.value;
    const translations = option['translated-value'];
    if (translations !== undefined) {
      const langState = store.getState().translationReducer;
      resVal = translations[langState.lang] || translations[langState.defaultLang] || resVal;
    }
    return resVal;
  }

};

export default PossibleValuesManager;
