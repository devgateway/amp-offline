import { HIERARCHICAL_VALUE, HIERARCHICAL_VALUE_DEPTH } from '../../utils/constants/ActivityConstants';
import { LOCATION_PATH } from '../../utils/constants/FieldPathConstants';
import store from '../../index';
import LoggerManager from '../../modules/util/LoggerManager';
import ActivityFieldsManager from './ActivityFieldsManager';

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

  buildFormattedHierarchicalValues(options) {
    // TODO optimize
    const hOptions = {};
    Object.values(options).forEach(option => {
      hOptions[option.id] = this.buildHierarchicalData(options, option.id);
    });
    return hOptions;
  },

  buildHierarchicalData(options, selectedId) {
    const option = Object.assign({}, options[selectedId]);
    const valueParts = this.getHierarchicalValue(options, selectedId);
    option[HIERARCHICAL_VALUE] = this.formatValueParts(valueParts);
    option[HIERARCHICAL_VALUE_DEPTH] = (valueParts && valueParts instanceof Array) ? valueParts.length : 0;
    return option;
  },

  getHierarchicalValue(options, selectedId) {
    const nameParts = [];
    let current = options[selectedId];
    while (current) {
      nameParts.push(this.getOptionTranslation(current));
      current = options[current.parentId];
    }
    return nameParts;
  },

  formatValueParts(valueParts) {
    return (valueParts && valueParts instanceof Array) ? `[${valueParts.reverse().join('][')}]` : valueParts;
  },

  /**
   * Fills hierarchical depth of each option
   * @param options
   */
  fillHierarchicalDepth(options) {
    Object.values(options).forEach(option => {
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
      if (option.parentId) {
        const parent = options[option.parentId];
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
  },

  setVisibility(options, fieldPath, filters) {
    options = { ...options };
    Object.values(options).forEach(option => {
      option.visible = true;
      if (LOCATION_PATH === fieldPath) {
        option.displayHierarchicalValue = true;
      }
    });
    if (filters) {
      filters.forEach(filter => {
        const filterBy = filter.value;
        Object.values(options).forEach(option => {
          const optionDataToCheck = ActivityFieldsManager.getValue(option, filter.path);
          if (option.visible && optionDataToCheck && (
            (optionDataToCheck instanceof Array && optionDataToCheck.includes(filterBy)) ||
            (optionDataToCheck === filterBy))) {
            option.visible = true;
          } else {
            option.visible = false;
          }
        });
      });
    }
    return options;
  }

};

export default PossibleValuesManager;
