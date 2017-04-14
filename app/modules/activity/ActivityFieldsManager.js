/* eslint-disable class-methods-use-this */
import { LANGUAGE_ENGLISH } from '../../utils/Constants';
import LoggerManager from '../../modules/util/LoggerManager';

/**
 * This is a helper class for checking fields status, getting field options translations and the like.
 * @author Nadejda Mandrescu
 */
export default class ActivityFieldsManager {
  /**
   * Shallow clone of another activityFieldsManager
   * @param activityFieldsManager
   * @return {ActivityFieldsManager}
   */
  static clone(activityFieldsManager: ActivityFieldsManager) {
    const newActivityFieldsManager = new ActivityFieldsManager([], []);
    Object.assign(newActivityFieldsManager, activityFieldsManager);
    return newActivityFieldsManager;
  }

  constructor(fieldsDef, possibleValuesCollection) {
    LoggerManager.log('constructor');
    this._fieldsDef = fieldsDef;
    this._possibleValuesMap = {};
    possibleValuesCollection.forEach(pv => { this._possibleValuesMap[pv.id] = pv['possible-options']; });
    this._fieldPathsEnabledStatusMap = {};
    this._lang = LANGUAGE_ENGLISH;
    this._defaultLang = LANGUAGE_ENGLISH;
    this._translationsCache = {};
    this._translationsCache[this._lang] = {};
  }

  set currentLanguageCode(lang) {
    this._lang = lang;
    if (!this._translationsCache[this._lang]) {
      this._translationsCache[this._lang] = {};
    }
  }

  set defaultLanguageCode(lang) {
    this._defaultLang = lang;
  }

  get fieldsDef() {
    return this._fieldsDef;
  }

  get possibleValuesMap() {
    return this._possibleValuesMap;
  }

  /**
   * Checks if the specified field path is enabled in AMP FM
   * @param fieldPath
   * @return {boolean}
   */
  isFieldPathEnabled(fieldPath) {
    if (this._fieldPathsEnabledStatusMap[fieldPath] === undefined) {
      this._buildFieldPathStatus(fieldPath);
    }
    return this._fieldPathsEnabledStatusMap[fieldPath];
  }

  _buildFieldPathStatus(fieldPath) {
    const pathParts = fieldPath.split('~');
    let currentTree = this._fieldsDef;
    const isDisabled = pathParts.some(part => {
      currentTree = currentTree.find(field => field.field_name === part);
      if (currentTree) {
        if (currentTree.field_type === 'list') {
          currentTree = currentTree.children;
        }
        return false;
      }
      return true;
    });
    this._fieldPathsEnabledStatusMap[fieldPath] = !isDisabled;
  }

  _getOrInitCache(fieldPath) {
    let cached = this._translationsCache[this._lang][fieldPath];
    if (cached === undefined) {
      cached = {};
      this._translationsCache[this._lang][fieldPath] = cached;
    }
    if (cached.value === undefined) {
      cached.value = {};
    }
    return cached;
  }

  /**
   * Find the translation for the original value for the given field path, if found, otherwise returns null
   * @param fieldPath
   * @param origValue
   * @return {string|null}
   */
  getValueTranslation(fieldPath, origValue) {
    const cached = this._getOrInitCache(fieldPath);
    let trnValue = cached.value[origValue];

    if (trnValue === undefined) {
      trnValue = null; // set to null to cache null and avoid the outer "if" test later
      const options = this._possibleValuesMap[fieldPath];
      if (options) {
        // TODO update based on latest AMP API AMP-25621 solution, set to default lang value if requested lang not found
        // const option = options.find(opt => opt['orig-value'] === origValue);
        const option = Object.values(options).find(opt => opt.value === origValue);
        if (option !== undefined) {
          // TODO remove option.value once AMP-25621 is done
          trnValue = option.value[this._lang] || option.value[this._defaultLang] || option.value || origValue;
        }
      }
      // cache result
      cached.value[origValue] = trnValue;
    }
    return trnValue;
  }

  getFieldLabelTranslation(fieldPath) {
    const cached = this._getOrInitCache(fieldPath);
    let trnLabel = cached.label;
    if (trnLabel === undefined) {
      trnLabel = null;
      let fieldsDef = this._fieldsDef;
      fieldPath.split('~').some(part => {
        if (!(fieldsDef instanceof Array)) {
          fieldsDef = fieldsDef.children;
        }
        fieldsDef = fieldsDef.find(fd => fd.field_name === part);
        return fieldsDef === undefined;
      });
      if (fieldsDef !== undefined) {
        trnLabel = fieldsDef.field_label[this._lang] || fieldsDef.field_label[this._defaultLang] || null;
      }
      cached.label = trnLabel;
    }
    return trnLabel;
  }

  getValue(object, fieldPath, fallbackDefaultLang: true) {
    const parts = fieldPath.split('~');
    let value = object;
    parts.some(part => {
      if (value instanceof Array) {
        const newList = [];
        value.forEach(current => {
          const newElement = current[part];
          if (newElement !== undefined && newElement !== null) {
            newList.concat(newElement);
          }
        });
        value = newList;
      } else {
        value = value[part];
      }
      return value === undefined || value === null || value.length === 0;
    });
    if (value !== undefined && value !== null && value.length !== 0) {
      let values = [].concat(value);
      values = values.map(val => {
        if (val.value !== undefined) {
          val = value.value;
        }
        val = val[this._lang] || (fallbackDefaultLang ? val[this._defaultLang] : val) || val;
        return val;
      });
      value = value instanceof Array ? values : values[0];
    }
    return value;
  }

}
