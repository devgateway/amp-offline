import { HIERARCHICAL_VALUE, HIERARCHICAL_VALUE_DEPTH } from '../../utils/constants/ActivityConstants';
import { LOCATION_PATH } from '../../utils/constants/FieldPathConstants';
import Logger from '../util/LoggerManager';
import FieldsManager from './FieldsManager';
import PossibleValuesHelper from '../helpers/PossibleValuesHelper';
import { LANGUAGE_ENGLISH } from '../../utils/Constants';

const logger = new Logger('Possible values manager');

/**
 * Possible Values manager that allows to fill in additional information and transformations
 * @author Nadejda Mandrescu
 */
export default class PossibleValuesManager {
  static _langState = {
    lang: LANGUAGE_ENGLISH,
    defaultLang: LANGUAGE_ENGLISH
  };

  static setLangState(langState) {
    PossibleValuesManager._langState = langState;
  }

  static buildFormattedHierarchicalValues(options) {
    // TODO optimize
    const hOptions = {};
    Object.values(options).forEach(option => {
      hOptions[option.id] = PossibleValuesManager.buildHierarchicalData(options, option.id);
    });
    return hOptions;
  }

  static buildHierarchicalData(options, selectedId) {
    const option = Object.assign({}, options[selectedId]);
    const valueParts = PossibleValuesManager.getHierarchicalValue(options, selectedId);
    option[HIERARCHICAL_VALUE] = PossibleValuesManager.formatValueParts(valueParts);
    option[HIERARCHICAL_VALUE_DEPTH] = (valueParts && valueParts instanceof Array) ? valueParts.length : 0;
    return option;
  }

  static getHierarchicalValue(options, selectedId) {
    const nameParts = [];
    let current = options[selectedId];
    while (current) {
      nameParts.push(PossibleValuesManager.getOptionTranslation(current));
      current = options[current.parentId];
    }
    return nameParts;
  }

  static formatValueParts(valueParts) {
    return (valueParts && valueParts instanceof Array) ? `[${valueParts.reverse().join('][')}]` : valueParts;
  }

  /**
   * Fills hierarchical depth of each option
   * @param options
   */
  static fillHierarchicalDepth(options) {
    Object.values(options).forEach(option => {
      PossibleValuesManager._fillHierarchicalDepth(options, option);
    });
    return options;
  }

  static _fillHierarchicalDepth(options, option) {
    if (!option) {
      logger.error(`option is unspecified: ${option}`);
      return 0;
    }
    let depth = option[HIERARCHICAL_VALUE_DEPTH];
    if (depth === undefined) {
      // So far it is based on the current locations extra info approach
      if (option.parentId) {
        const parent = options[option.parentId];
        depth = 1 + PossibleValuesManager._fillHierarchicalDepth(options, parent);
      } else {
        depth = 0;
      }
      option[HIERARCHICAL_VALUE_DEPTH] = depth;
    }
    return depth;
  }

  static findOption(options, id) {
    return Object.values(options).find(o => o.id === id);
  }

  static getOptionTranslation(option) {
    let resVal = option.value;
    const translations = option['translated-value'];
    if (translations !== undefined) {
      const langState = PossibleValuesManager._langState;
      resVal = translations[langState.lang] || translations[langState.defaultLang] || resVal;
    }
    return resVal;
  }

  static setVisibility(options, fieldPath, filters) {
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
          const optionDataToCheck = FieldsManager.getValue(option, filter.path);
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

  static getTreeSortedOptionsList(optionsObj) {
    const added = new Set();
    const optionsList = [];
    const idsStack = Object.values(optionsObj).filter(o => !o.parentId).sort(PossibleValuesHelper.reverseSortOptions)
      .map(o => o.id);
    while (idsStack.length) {
      const id = idsStack.pop();
      if (!added.has(id)) {
        const option = optionsObj[id];
        if (option.reverseSortedChildren) {
          idsStack.push(...option.reverseSortedChildren);
        }
        added.add(id);
        optionsList.push(option);
      }
    }
    return optionsList;
  }

}
